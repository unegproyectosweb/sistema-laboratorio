import { LoginSchema } from "@uneg-lab/api-types/auth.js";
import { IsString } from "class-validator";
import { createZodDto } from "nestjs-zod";

export class LoginDto extends createZodDto(LoginSchema) {
  @IsString()
  password: string;

  @IsString()
  username: string;
}
