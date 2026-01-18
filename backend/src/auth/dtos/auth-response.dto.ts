import { AuthResponseSchema } from "@uneg-lab/api-types/auth.js";
import { createZodDto } from "nestjs-zod";
import { UserDto } from "./user.dto";
import { IsString } from "class-validator";

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {
  @IsString()
  accessToken: string;

  user: UserDto;
}
