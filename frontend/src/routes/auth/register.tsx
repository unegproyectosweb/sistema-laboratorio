import RegisterForm from "@/components/auth/register-form";
import { submitRegisterForm } from "@/components/auth/register-form/form";
import type { Route } from "./+types/register";

export const meta: Route.MetaFunction = () => [
  { title: "Crear cuenta - Sistema de Reservas de Laboratorio - UNEG" },
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  return await submitRegisterForm(request, { admin: false });
}

export default function RegisterRoute({ actionData }: Route.ComponentProps) {
  return (
    <RegisterForm
      lastResult={actionData}
      title="Crear cuenta"
      subtitle="Crea tu cuenta para continuar."
      asideTitle="¡Bienvenido de Nuevo!"
      asideSubtitle="Si ya tienes una cuenta, inicia sesión para acceder a tu cuenta."
      loginButton={true}
    />
  );
}
