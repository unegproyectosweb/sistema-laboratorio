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
import { getInputProps, type SubmissionResult } from "@conform-to/react";
import { Form, Link } from "react-router";
import { useRegisterForm } from "./form";

interface RegisterFormProps {
  lastResult: SubmissionResult<string[]> | undefined;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  asideTitle: React.ReactNode;
  asideSubtitle: React.ReactNode;
  loginButton?: boolean;
}

export default function RegisterForm({
  lastResult,
  title,
  subtitle,
  asideTitle,
  asideSubtitle,
  loginButton,
}: RegisterFormProps) {
  const { form, fields, isSubmitting } = useRegisterForm({ lastResult });

  return (
    <AuthTemplate
      title={title}
      subtitle={subtitle}
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
              {asideTitle}
            </div>
            <div className="text-sm leading-snug">{asideSubtitle}</div>
          </div>
          {loginButton ? (
            <Button
              asChild
              variant="outline"
              className="bg-transparent uppercase"
            >
              <Link to="/login">INICIAR SESIÓN</Link>
            </Button>
          ) : null}
        </>
      }
    />
  );
}
