import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types";
import { ReservationsTable } from "./reservations-table";

export default function Reservas(_: Route.ComponentProps) {
  return (
    <section className="p-4">
      <header className="flex flex-wrap justify-between gap-5 p-3">
        <div>
          <CardTitle className="text-lg">Gestion de Solicitudes</CardTitle>
          <CardDescription>
            Administra consultas y reservas de manera eficiente
          </CardDescription>
        </div>

        <Button asChild variant="default" className="w-full md:w-auto">
          <Link to="/reservas/nueva">
            <Plus className="size-4" />
            Nueva Reserva
          </Link>
        </Button>
      </header>

      <div className="p-3">
        <h3 className="mb-4 font-semibold">Lista De Reservas</h3>
        <ReservationsTable />
      </div>
    </section>
  );
}
