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
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import type { Request as RequestType, Response as ResponseType } from "express";
import { RoleEnum, User } from "../users/user.entity.js";
import { UsersService } from "../users/users.service.js";
import { SignInDto, SignUpDto } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";
import { AuthenticatedGuard } from "./guards/authenticated.guard.js";
import { LocalGuard } from "./guards/local.guard.js";
import { Auth } from "./decorators/auth.decorator.js";

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
  @ApiBody({ type: SignInDto })
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
  async register(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.register(signUpDto, res);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post("register/admin")
  async registerAdmin(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: ResponseType,
  ) {
    return await this.authService.registerAdmin(signUpDto, res);
  }

  @Post("refresh")
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

  @UseGuards(AuthenticatedGuard)
  @Get("me")
  async getProfile(@Request() req: RequestType) {
    const user = await this.userService.findOne(req.user!.id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
