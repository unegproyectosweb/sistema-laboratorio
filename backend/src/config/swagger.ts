import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Sistema de Reservas de Laboratorio")
    .setDescription("API para la gestión de reservas de laboratorio")
    .setVersion("1.0")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, documentFactory);
}
