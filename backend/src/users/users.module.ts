import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./entities/refresh-token.entity.js";
import { User } from "./entities/user.entity.js";
import { UsersService } from "./services/users.service.js";
import { RefreshTokenService } from "./services/refresh-token.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [UsersService, RefreshTokenService],
  exports: [UsersService, RefreshTokenService],
})
export class UsersModule {}
