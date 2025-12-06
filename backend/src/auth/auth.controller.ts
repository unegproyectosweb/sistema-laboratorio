import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request as RequestType, Response as ResponseType } from "express";
import { ZodResponse } from "nestjs-zod";
import { User } from "../users/entities/user.entity.js";
import { UsersService } from "../users/services/users.service.js";
import { PermissionEnum } from "./auth.permissions.js";
import { AuthService } from "./auth.service.js";
import { Auth } from "./decorators/auth.decorator.js";
import { AuthResponseDto } from "./dtos/auth-response.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { UserDto } from "./dtos/user.dto.js";
import { LocalGuard } from "./guards/local.guard.js";
import { UserMapper } from "./mappers/user.mapper.js";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private authService: AuthService,
    @Inject(UsersService)
    private userService: UsersService,
  ) {}

  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @ZodResponse({ type: AuthResponseDto })
  async login(
    @Body() _loginDto: LoginDto,
    @Req() req: RequestType,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    // Cast user to User type only here.
    // Because LocalStrategy returns the whole user object
    const user = req.user as any as User;
    return await this.authService.login(user, res);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("register")
  @ZodResponse({ type: AuthResponseDto })
  async register(
    @Body() signUpDto: RegisterDto,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.register(signUpDto, res);
  }

  @Auth(PermissionEnum.CREATE_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post("register/admin")
  async registerAdmin(@Body() signUpDto: RegisterDto) {
    return await this.authService.registerAdmin(signUpDto);
  }

  @Post("refresh")
  @ZodResponse({ type: AuthResponseDto })
  async refresh(
    @Req() req: RequestType,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.refreshToken(req, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(
    @Req() req: RequestType,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.logout(req, res);
  }

  @Auth()
  @Get("me")
  @ZodResponse({ type: UserDto })
  async getProfile(@Req() req: RequestType): Promise<UserDto> {
    const user = await this.userService.findOne(req.user!.id);
    if (!user) throw new NotFoundException("User not found");
    return UserMapper.toDto(user);
  }
}
