import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { RoleEnum } from "../../auth/auth.permissions.js";
import { RegisterDto } from "../../auth/dtos/register.dto.js";
import { User } from "../entities/user.entity.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  existsById(id: string): Promise<boolean> {
    return this.usersRepository.existsBy({ id });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOneBy({ username: ILike(username) });
  }

  async create(data: RegisterDto): Promise<User> {
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
      role: RoleEnum.USER,
    });

    return this.usersRepository.save(user);
  }
}
