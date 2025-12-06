import { RegisterSchema } from "@uneg-lab/api-types/auth.js";
import { createZodDto } from "nestjs-zod";

export class RegisterDto extends createZodDto(RegisterSchema) {}
