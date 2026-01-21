import RegisterForm from "@/components/auth/register-form";

export default function RegisterRouteAdministrador() {
  return (
    <>
      <title>
        Crear cuenta administrador - Sistema de Reservas de Laboratorio - UNEG
      </title>
      <RegisterForm
        title="Crear Administrador"
        subtitle="Crea administradores de manera rapida."
        asideTitle="¡Bienvenido Administrador!"
        asideSubtitle="Crea administradores para gestionar el sistema de reservas de forma rapida y segura"
        loginButton={false}
        admin={true}
      />
    </>
  );
}
