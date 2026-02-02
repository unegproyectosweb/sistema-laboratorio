import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig = registerAs(
  "database",
  () =>
    ({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [__dirname + "/../**/*.entity{.ts,.js,.mjs,.cjs}"],
      migrations: [__dirname + "/../migrations/*{.ts,.js,.mjs,.cjs}"],
      synchronize: false,
      // cache: {
      //   type: "ioredis",
      //   options: process.env.REDIS_URL,
      // },
    }) satisfies TypeOrmModuleOptions,
);
