import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { User } from "../entities/user.entity.js";
import { RoleEnum } from "@uneg-lab/api-types/auth.js";
import { RegisterDto } from "../../auth/dtos/register.dto.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      cache: { id: `user:by_id:${id}`, milliseconds: 60_000 },
    });
  }

  existsById(id: string): Promise<boolean> {
    return this.usersRepository.existsBy({ id });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username: ILike(username) },
      cache: { id: `user:by_username:${username}`, milliseconds: 60_000 },
    });
  }

  async create(
    data: RegisterDto,
    role: RoleEnum = RoleEnum.USER,
  ): Promise<User> {
    if (data.email) {
      const existsEmail = await this.usersRepository.existsBy({
        email: data.email,
      });

      if (existsEmail) {
        throw new ConflictException("El email ya está en uso");
      }
    }

    const existsUsername = await this.usersRepository.existsBy({
      username: ILike(data.username),
    });

    if (existsUsername) {
      throw new ConflictException("El nombre de usuario ya está en uso");
    }

    const user = this.usersRepository.create({
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name,
      role,
    });

    return await this.usersRepository.save(user);
  }
}
