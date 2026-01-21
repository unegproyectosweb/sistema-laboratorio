import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;
}
