import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import { User } from "../users/user.entity.js";
import { UsersService } from "../users/users.service.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE,
} from "./auth.constants.js";
import { AuthResponseDto, SignUpDto } from "./auth.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async createAccessToken(
    userId: string,
    username: string,
    role: string,
  ) {
    const payload = { sub: userId, username, role };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  async login(
    user: User,
    res: Response,
    oldRefreshTokenId: string | null = null,
  ) {
    const accessToken = await this.createAccessToken(
      user.id,
      user.username,
      user.role,
    );

    const refreshToken = await this.usersService.createRefreshToken(
      user.id,
      oldRefreshTokenId,
    );

    this.setRefreshTokenCookie(refreshToken, res);

    return new AuthResponseDto({
      accessToken,
      user,
    });
  }

  async register(signUpDto: SignUpDto, res: Response) {
    const user = await this.usersService.create(signUpDto);
    return await this.login(user, res);
  }

  async registerAdmin(signUpDto: SignUpDto) {
    await this.usersService.createAdmin(signUpDto);
    return { message: "Admin registered successfully" };
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as
      | string
      | undefined;
    const tokenEntity =
      await this.usersService.validateRefreshToken(refreshToken);
    if (!tokenEntity) throw new UnauthorizedException();
    const user = tokenEntity.user;

    if (!user) throw new UnauthorizedException();

    return await this.login(user, res, tokenEntity.id);
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as
      | string
      | undefined;
    if (refreshToken) await this.usersService.disposeRefreshToken(refreshToken);

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    return { message: "Logged out successfully" };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) return null;

    const isValid = await user.validatePassword(password);
    if (!isValid) return null;

    return user;
  }

  getRefreshTokenCookie(req: Request): string | undefined {
    return req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  }

  private setRefreshTokenCookie(token: string, res: Response): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}
