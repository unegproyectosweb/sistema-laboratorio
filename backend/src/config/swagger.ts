import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

export function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Sistema de Reservas de Laboratorio")
    .setDescription("API para la gestión de reservas de laboratorio")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const documentFactory = () =>
    cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));

  SwaggerModule.setup("api", app, documentFactory);
}
