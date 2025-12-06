import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service.js";
import { LoginDto } from "../dtos/login.dto.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "username" satisfies keyof LoginDto,
      passwordField: "password" satisfies keyof LoginDto,
      session: false,
      passReqToCallback: false,
    });
  }

  async validate(username: string, password: string): Promise<Express.User> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: "Nombre de usuario o contraseña incorrectos",
        code: "INVALID_CREDENTIALS",
      });
    }

    return user;
  }
}
