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
import { setErrorFromServer } from "@/lib/api";
import * as auth from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { registerFormSchema } from "./schema";

interface RegisterFormProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  asideTitle: React.ReactNode;
  asideSubtitle: React.ReactNode;
  loginButton?: boolean;
  admin: boolean;
}

export default function RegisterForm({
  title,
  subtitle,
  asideTitle,
  asideSubtitle,
  loginButton,
  admin,
}: RegisterFormProps) {
  const navigate = useNavigate();
  const formId = useId();
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
  });
  const { handleSubmit, setError, register, formState } = form;
  const { isSubmitting, errors } = formState;

  return (
    <AuthTemplate
      title={title}
      subtitle={subtitle}
      content={
        <form
          noValidate
          onSubmit={handleSubmit(async (values) => {
            const { confirmPassword: _, ...data } = values;

            try {
              await (admin
                ? auth.registerAdministrator(data)
                : auth.register(data));
              navigate("/");
            } catch (error) {
              setErrorFromServer(setError, error);
            }
          })}
          className="md:min-w-lg"
        >
          <FieldGroup className="md:gap-3">
            <Field>
              <FieldLabel htmlFor={`${formId}-username`}>
                Nombre de Usuario
              </FieldLabel>
              <Input
                placeholder="Ingresa tu nombre de usuario"
                autoComplete="username"
                type="text"
                id={`${formId}-username`}
                {...register("username")}
              />
              <FieldError>{errors.username?.message}</FieldError>
            </Field>
            <div className="flex flex-col gap-4 *:flex-1 md:flex-row">
              <Field>
                <FieldLabel htmlFor={`${formId}-name`}>Nombre</FieldLabel>
                <Input
                  placeholder="Ingresa tu nombre"
                  autoComplete="name"
                  type="text"
                  id={`${formId}-name`}
                  {...register("name")}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
                <Input
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  type="email"
                  id={`${formId}-email`}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor={`${formId}-password`}>Contraseña</FieldLabel>
              <PasswordInput
                placeholder="Ingresa tu contraseña"
                autoComplete="new-password"
                id={`${formId}-password`}
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-confirm-password`}>
                Confirmar contraseña
              </FieldLabel>
              <PasswordInput
                id={`${formId}-confirm-password`}
                {...register("confirmPassword")}
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
              />
              <FieldError>{errors.confirmPassword?.message}</FieldError>
            </Field>

            <Field>
              <FieldError>{errors.root?.message}</FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
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
