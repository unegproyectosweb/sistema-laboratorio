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
import { ApiBody, ApiOkResponse } from "@nestjs/swagger";
import type { Request as RequestType, Response as ResponseType } from "express";
import { User } from "../users/entities/user.entity.js";
import { UsersService } from "../users/services/users.service.js";
import { AuthService } from "./auth.service.js";
import { Auth } from "./decorators/auth.decorator.js";
import { AuthResponseDto } from "./dtos/auth-response.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LocalGuard } from "./guards/local.guard.js";

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
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
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
  @ApiOkResponse({ type: AuthResponseDto })
  async register(
    @Body() signUpDto: RegisterDto,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.register(signUpDto, res);
  }

  @Post("refresh")
  @ApiOkResponse({ type: AuthResponseDto })
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
  async getProfile(@Req() req: RequestType) {
    const user = await this.userService.findOne(req.user!.id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
