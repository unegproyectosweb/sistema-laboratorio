import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import session from "express-session";
import { ms } from "ms";
import passport from "passport";
import { AppModule } from "./app.module.js";
import { SessionStore } from "./auth/session.store.js";
import { configureSwagger } from "./config/swagger.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const cookieSecret = configService.getOrThrow<string>("COOKIE_SECRET");
  app.use(cookieParser(cookieSecret));
  app.use(
    session({
      secret: cookieSecret,
      cookie: {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: ms("7d"),
      },
      resave: false,
      saveUninitialized: false,
      store: app.get(SessionStore),
    }),
  );
  app.use(passport.session());

  configureSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
