import {
  ClassSerializerInterceptor,
  ConsoleLogger,
  ValidationPipe,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { configureSwagger } from "./config/swagger.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === "production",
    }),
  });

  app.setGlobalPrefix("api");

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  configureSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap the application:", err);
  process.exit(1);
});
