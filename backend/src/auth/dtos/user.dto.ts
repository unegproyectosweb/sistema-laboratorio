import { UserSchema } from "@uneg-lab/api-types/auth.js";
import { createZodDto } from "nestjs-zod";

export class UserDto extends createZodDto(UserSchema) {}
