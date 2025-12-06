import { AuthResponseSchema } from "@uneg-lab/api-types/auth.js";
import { createZodDto } from "nestjs-zod";

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
