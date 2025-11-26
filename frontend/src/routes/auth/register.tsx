import { AuthTemplate } from "@/components/auth/auth-template";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { register } from "@/lib/auth";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { omit } from "lodash-es";
import { Form, Link, redirect, useNavigation } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/register";
import { HTTPError } from "ky";
import { extractErrorMessages } from "@/lib/api";

const registerSchema = z
  .object({
    username: z
      .string({ error: "El nombre de usuario es requerido" })
      .nonempty({ error: "El nombre de usuario es requerido" }),
    name: z
      .string({ error: "El nombre es requerido" })
      .nonempty({ error: "El nombre es requerido" }),
    email: z.email({ error: "Correo electrónico inválido" }),
    password: z
      .string({ error: "La contraseña es requerida" })
      .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string({ error: "Confirma la contraseña" }),
    acceptTerms: z
      .string()
      .optional()
      .refine((value) => value === "on", {
        message: "Debes aceptar los términos y condiciones",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const meta: Route.MetaFunction = () => [
  { title: "Crear cuenta - Sistema de Reservas de Laboratorio - UNEG" },
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: registerSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await register(submission.value).then(
    () => {
      throw redirect("/");
    },
    async (error) => {
      const errors = await extractErrorMessages(error);
      return submission.reply({
        formErrors: errors,
      });
    },
  );
}

export default function RegisterRoute({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate(context) {
      return parseWithZod(context.formData, { schema: registerSchema });
    },
  });
  return (
    <AuthTemplate
      title="Crear cuenta"
      subtitle="Crea tu cuenta para continuar."
      content={
        <Form
          noValidate
          method="post"
          id={form.id}
          onSubmit={form.onSubmit}
          className="md:min-w-lg"
        >
          <FieldGroup className="md:gap-3">
            <Field>
              <FieldLabel htmlFor={fields.username.id}>
                Nombre de Usuario
              </FieldLabel>
              <Input
                placeholder="Ingresa tu nombre de usuario"
                autoComplete="username"
                {...getInputProps(fields.username, { type: "text" })}
              />
              <FieldError id={fields.username.errorId}>
                {fields.username.errors}
              </FieldError>
            </Field>
            <div className="flex flex-col gap-4 *:flex-1 md:flex-row">
              <Field>
                <FieldLabel htmlFor={fields.name.id}>Nombre</FieldLabel>
                <Input
                  placeholder="Ingresa tu nombre"
                  autoComplete="name"
                  {...getInputProps(fields.name, { type: "text" })}
                />
                <FieldError id={fields.name.errorId}>
                  {fields.name.errors}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
                <Input
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  {...getInputProps(fields.email, { type: "email" })}
                />
                <FieldError id={fields.email.errorId}>
                  {fields.email.errors}
                </FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor={fields.password.id}>Contraseña</FieldLabel>
              <PasswordInput
                placeholder="Ingresa tu contraseña"
                autoComplete="new-password"
                {...getInputProps(fields.password, { type: "password" })}
              />
              <FieldError id={fields.password.errorId}>
                {fields.password.errors}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={fields.confirmPassword.id}>
                Confirmar contraseña
              </FieldLabel>
              <PasswordInput
                {...getInputProps(fields.confirmPassword, { type: "password" })}
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
              />
              <FieldError id={fields.confirmPassword.errorId}>
                {fields.confirmPassword.errors}
              </FieldError>
            </Field>

            <Field>
              <Label className="flex items-center gap-2 text-sm">
                <Checkbox
                  {...omit(
                    getInputProps(fields.acceptTerms, { type: "checkbox" }),
                    "type",
                  )}
                />
                <span>Acepto los términos y condiciones</span>
              </Label>
              <FieldError>{fields.acceptTerms?.errors}</FieldError>
            </Field>

            <Field>
              <FieldError>{form.errors}</FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </Field>
          </FieldGroup>
        </Form>
      }
      asideContent={
        <>
          <div className="flex flex-col gap-3">
            <div className="hidden text-4xl font-medium md:block">
              ¡Bienvenido de Nuevo!
            </div>
            <div className="text-sm leading-snug">
              Si ya tienes una cuenta, inicia sesión para acceder a tu cuenta.
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="bg-transparent uppercase"
          >
            <Link to="/login">INICIAR SESIÓN</Link>
          </Button>
        </>
      }
    />
  );
}
