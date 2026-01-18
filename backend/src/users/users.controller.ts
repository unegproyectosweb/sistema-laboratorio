import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { RegisterDto } from "../auth/dtos/register.dto.js";
import { UsersService } from "./services/users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() registerDto: RegisterDto) {
    return await this.usersService.create(registerDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  @Get("username/:username")
  async findByUsername(@Param("username") username: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException(`Usuario @${username} no encontrado`);
    }
    return user;
  }
}
