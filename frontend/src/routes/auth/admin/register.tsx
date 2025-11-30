import RegisterForm from "@/components/auth/register-form";
import { submitRegisterForm } from "@/components/auth/register-form/form";
import type { Route } from "./+types/register";

export const meta: Route.MetaFunction = () => [
  {
    title:
      "Crear cuenta administrador - Sistema de Reservas de Laboratorio - UNEG",
  },
];

export async function clientAction({ request }: Route.ClientActionArgs) {
  return await submitRegisterForm(request, { admin: true });
}

export default function RegisterRouteAdministrador({
  actionData,
}: Route.ComponentProps) {
  return (
    <RegisterForm
      title="Crear Administrador"
      subtitle="Crea administradores de manera rapida."
      asideTitle="¡Bienvenido Administrador!"
      asideSubtitle="Crea administradores para gestionar el sistema de reservas de forma rapida y segura"
      loginButton={false}
      lastResult={actionData}
    />
  );
}
