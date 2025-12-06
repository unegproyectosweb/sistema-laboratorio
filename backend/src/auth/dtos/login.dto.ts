import { LoginSchema } from "@uneg-lab/api-types/auth.js";
import { createZodDto } from "nestjs-zod";

export class LoginDto extends createZodDto(LoginSchema) {}
