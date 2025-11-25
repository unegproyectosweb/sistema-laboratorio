import { AuthTemplate } from "@/components/auth/auth-template";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Form, Link } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/login";

const loginSchema = z.object({
  email: z.email({ error: "Correo electrónico inválido" }),
  password: z.string({ error: "La contraseña es requerida" }),
});

export const meta: Route.MetaFunction = () => [
  { title: "Login - Sistema de Reservas de Laboratorio - UNEG" },
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  return submission.reply({
    formErrors: ["Credenciales inválidas. Por favor, intenta de nuevo."],
  });
}

export default function LoginRoute({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult: actionData,
    onValidate(context) {
      return parseWithZod(context.formData, { schema: loginSchema });
    },
  });

  return (
    <AuthTemplate
      title="Iniciar Sesión"
      subtitle="Ingresa tus credenciales para continuar."
      content={
        <Form noValidate method="post" id={form.id} onSubmit={form.onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
              <Input
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                {...getInputProps(fields.email, { type: "email" })}
              />
              <FieldError>{fields.email.errors}</FieldError>
            </Field>

            <Field>
              <div className="flex justify-between gap-4">
                <FieldLabel htmlFor={fields.password.id}>Contraseña</FieldLabel>

                <Button
                  type="button"
                  variant="link"
                  className="max-md:hidden"
                  asChild
                >
                  <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                </Button>
              </div>
              <PasswordInput
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                {...getInputProps(fields.password, { type: "password" })}
              />
              <FieldError>{fields.password.errors}</FieldError>
            </Field>

            {/* <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <Label>
                <Checkbox name="remember" />
                <span className="font-medium">¿Recordar tu contraseña?</span>
              </Label>
            </div> */}
            <Field>
              <FieldError>{form.errors}</FieldError>
            </Field>

            <Field>
              <Button type="submit">INICIAR SESIÓN</Button>
            </Field>

            <Field className="md:hidden">
              <Button type="button" variant="link" asChild>
                <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
              </Button>
            </Field>

            <p className="text-muted-foreground text-center text-sm">
              ¿Aún no tienes cuenta?{" "}
              <Button asChild variant="link" size="sm">
                <Link to="/register">Regístrate aquí</Link>
              </Button>
            </p>
          </FieldGroup>
        </Form>
      }
      asideContent={
        <>
          <div className="flex flex-col gap-3">
            <div className="hidden text-4xl font-medium md:block">
              ¡Hola, Amigo!
            </div>
            <div className="text-sm leading-snug">
              Ingresa tus datos personales y comienza tu viaje con nosotros hoy
              mismo.
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="bg-transparent uppercase"
          >
            <Link to="/register">Registrarse</Link>
          </Button>
        </>
      }
    />
  );
}
