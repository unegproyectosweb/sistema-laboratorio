import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Outlet, useNavigate } from "react-router";
import type { Route } from "./+types/error";
import z, { ZodError } from "zod";

export default function ErrorLayout() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();

  let title = "Ha ocurrido un error inesperado";
  let message: React.ReactNode =
    "Lo sentimos, algo salió mal. Por favor, intenta nuevamente más tarde.";
  let icon = <AlertCircle className="text-destructive h-10 w-10" />;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Página no encontrada";
      message = "La página que estás buscando no existe o ha sido movida.";
      icon = <AlertCircle className="h-10 w-10 text-orange-500" />;
    } else if (error.status === 401) {
      title = "No autorizado";
      message =
        "No tienes permiso para ver esta página. Por favor, inicia sesión.";
      icon = <AlertCircle className="h-10 w-10 text-yellow-500" />;
    } else if (error.status === 403) {
      title = "Acceso denegado";
      message =
        "No tienes los permisos necesarios para acceder a este recurso.";
      icon = <AlertCircle className="h-10 w-10 text-red-500" />;
    } else if (error.status === 503) {
      title = "Servicio no disponible";
      message =
        "El servicio está temporalmente no disponible. Intenta de nuevo más tarde.";
    } else {
      title = `${error.status} ${error.statusText}`;
      message = error.data?.message || message;
    }
  } else if (error instanceof ZodError) {
    title = "Error de validación de datos";
    message = (
      <>
        <p className="mb-2 text-left">Se encontraron los siguientes errores:</p>
        <pre className="text-left text-sm leading-tight">
          {z.prettifyError(error)}
        </pre>
      </>
    );
    icon = <AlertCircle className="h-10 w-10 text-red-500" />;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">{icon}</div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="mt-2 text-base">
            {message}
          </CardDescription>
        </CardHeader>
        {import.meta.env.DEV && error instanceof Error && (
          <CardContent className="flex flex-col gap-4">
            <div className="bg-muted max-h-40 overflow-auto rounded-md p-4 font-mono text-xs">
              {error.stack}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>
          <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Ir al Inicio
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
