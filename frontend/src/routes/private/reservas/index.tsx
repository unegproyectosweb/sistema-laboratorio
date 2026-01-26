import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types";
import { ReservationsTable } from "./reservations-table";

export default function Reservas(_: Route.ComponentProps) {
  const [activeTab, setActiveTab] = useState<"reservas" | "solicitudes">(
    "reservas",
  );

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
        <ToggleGroup
          className="mb-4"
          variant="rounded"
          type="single"
          value={activeTab}
          onValueChange={setActiveTab as any}
          spacing={1}
        >
          <ToggleGroupItem variant="rounded" value="reservas" size="sm">
            Reservas
          </ToggleGroupItem>
          <ToggleGroupItem variant="rounded" value="solicitudes" size="sm">
            Solicitudes
          </ToggleGroupItem>
        </ToggleGroup>

        <h3 className="mb-4 font-semibold">Lista De Reservas</h3>
        <Suspense fallback={<Skeleton />}>
          <ReservationsTable />
        </Suspense>
      </div>
    </section>
  );
}
