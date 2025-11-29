import { Type } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";
import { User } from "../users/user.entity.js";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string;
  @ApiProperty({ type: String })
  @IsString()
  password: string;
}

export class SignUpDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiProperty({ type: String })
  @IsStrongPassword(
    { minSymbols: 0, minLength: 6, minUppercase: 0, minNumbers: 0 },
    {
      message: "La contraseña debe tener al menos 6 caracteres.",
    },
  )
  password: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

export class AuthResponseDto {
  accessToken: string;

  @Type(() => User)
  user: User;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
