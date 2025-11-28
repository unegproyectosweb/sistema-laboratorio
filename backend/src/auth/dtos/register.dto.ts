import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEmail,
  IsStrongPassword,
} from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty()
  @IsStrongPassword(
    { minSymbols: 0, minLength: 6, minUppercase: 0, minNumbers: 0 },
    {
      message: "La contraseña debe tener al menos 6 caracteres.",
    },
  )
  password: string;
}
