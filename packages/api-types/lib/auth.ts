import { z } from "zod";

export enum RoleEnum {
  USER = "user",
  ADMIN = "admin",
}

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  email: z.email().nullable(),
  role: z.enum(RoleEnum),
});

export type UserType = z.infer<typeof UserSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const LoginSchema = z.object({
  username: z
    .string({ error: "El nombre de usuario es requerido" })
    .nonempty({ error: "El nombre de usuario es requerido" }),
  password: z
    .string({ error: "La contraseña es requerida" })
    .nonempty({ error: "La contraseña es requerida" }),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  username: z
    .string({ error: "El nombre de usuario es requerido" })
    .nonempty({ error: "El nombre de usuario es requerido" }),
  name: z
    .string({ error: "El nombre es requerido" })
    .nonempty({ error: "El nombre es requerido" }),
  email: z.email({ error: "Correo electrónico inválido" }).nullish(),
  password: z
    .string({ error: "La contraseña es requerida" })
    .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

export type RegisterType = z.infer<typeof RegisterSchema>;
