import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, AuthModule, UsersModule],
  providers: [AppService],
})
export class AppModule {}
