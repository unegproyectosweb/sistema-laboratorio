import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { databaseConfig } from "./config/database.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { HttpExceptionFilter } from "./http-exception.filter.js";
import { ReservationsModule } from "./reservations/reservations.module.js";
import { UsersModule } from "./users/users.module.js";
import { LaboratoriesModule } from "./laboratories/laboratories.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ReservationsModule,
    HealthModule,
    LaboratoriesModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [],
})
export class AppModule {}
