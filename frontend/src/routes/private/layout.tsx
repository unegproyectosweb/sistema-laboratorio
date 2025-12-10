import type { NavSection } from "@/components/app-sidebar";
import PrivateLayout from "@/components/private-layout";
import { getSession, seemsAuthenticated } from "@/lib/auth";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";

const authMiddleware: Route.ClientMiddlewareFunction = async () => {
  const isAuth = seemsAuthenticated();

  if (!isAuth) {
    throw redirect("/login");
  }

  getSession();
};

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sistema de Reservas de Laboratorio - UNEG" },
    {
      name: "description",
      content:
        "Sistema de reservas de laboratorios de la UNEG, donde los usuarios pueden gestionar y visualizar sus reservas.",
    },
  ];
}

const navSections: NavSection[] = [
  {
    label: "RESUMEN",
    items: [
      {
        title: "Dashboard Principal",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "GESTIÓN",
    items: [
      { title: "Consultas y Reservas", href: "/reservas", icon: FileText },
    ],
  },
  {
    label: "CUENTA",
    items: [{ title: "Configuración", href: "/config", icon: Settings }],
  },
];

export default function Component() {
  return (
    <PrivateLayout sections={navSections}>
      <Outlet />
    </PrivateLayout>
  );
}
