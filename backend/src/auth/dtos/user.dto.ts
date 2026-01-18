import { RoleEnum, UserSchema } from "@uneg-lab/api-types/auth.js";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { createZodDto } from "nestjs-zod";

export class UserDto extends createZodDto(UserSchema) {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string | null;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
