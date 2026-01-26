import { StatsCards } from "@/components/dashboard/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { reservationsService } from "@/services/reservations";
import { statsService } from "@/services/stats";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Reservation } from "@uneg-lab/api-types/reservation";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import type { Route } from "./+types/dashboard";

type TabType = "Todas" | "Semestral" | "Evento" | "Especial";

function formatDateLocal(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHorario(r: Reservation) {
  if (r.defaultStartTime && r.defaultEndTime)
    return `${r.defaultStartTime} - ${r.defaultEndTime}`;
  if (r.defaultStartTime) return r.defaultStartTime;
  return "—";
}

export default function DashboardPage(_: Route.ComponentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Todas");

  const { data: stats } = useSuspenseQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => statsService.reservations(),
  });

  const { data: recent } = useSuspenseQuery({
    queryKey: ["dashboard", "recentReservations"],
    queryFn: () => reservationsService.search({ limit: 8 }),
  });

  const items = recent?.data ?? [];

  const filteredReservas =
    activeTab === "Todas"
      ? items
      : items.filter((r) => r.type?.name === activeTab);

  return (
    <div className="flex-1 bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Panel de Administración
            </h1>
            <p className="text-slate-600">
              Sistema de Reservas Laboratorio UNEG
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          pendientes={stats?.pendientes ?? 0}
          aprobadas={stats?.aprobadas ?? 0}
          rechazadas={stats?.rechazadas ?? 0}
          canceladas={stats?.canceladas ?? 0}
          total={stats?.total ?? 0}
        />

        {/* Gestión de Reservas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center justify-between text-center text-pretty md:flex-row">
              <CardTitle className="text-xl font-semibold">
                Gestión de Reservas
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                Revisa y gestiona todas las solicitudes de reserva
              </span>
            </div>

            {/* Tabs */}
            <div className="flex flex-col items-center justify-between gap-4 max-md:*:w-full md:flex-row">
              <div className="flex flex-wrap gap-2 border-b pt-4">
                {(["Todas", "Semestral", "Evento", "Especial"] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-2 text-sm font-medium transition-colors md:px-4",
                        activeTab === tab
                          ? "border-accent-foreground text-accent-foreground border-b-2"
                          : "hover:text-accent-foreground text-muted-foreground",
                      )}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
              <Estados />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {filteredReservas.map((reserva) => (
              <CardReserva key={reserva.id} reserva={reserva} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Estados() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="bg-accent-foreground text-white hover:bg-slate-800"
        >
          Todos los estados ▼
        </Button>
      </DropdownMenuTrigger>
      {/* <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Estados</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>1</DropdownMenuItem>
          <DropdownMenuItem>2</DropdownMenuItem>
          <DropdownMenuItem>3</DropdownMenuItem>
          <DropdownMenuItem>4</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
}

function CardReserva({ reserva }: { reserva: Reservation }) {
  return (
    <Card className="border border-slate-200 p-3 transition-all hover:border-slate-300 md:p-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              {reserva.user?.name ?? reserva.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-100"
            >
              {reserva.state?.name}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">{reserva.name}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span>{reserva.laboratory?.name ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {formatDateLocal(reserva.startDate)} -{" "}
                {reserva.endDate ? formatDateLocal(reserva.endDate) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatHorario(reserva)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-full border-slate-300 hover:bg-slate-100"
            title="Ver detalles"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700"
            title="Aprobar"
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-full border-red-300 text-red-600 hover:bg-red-50"
            title="Rechazar"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
