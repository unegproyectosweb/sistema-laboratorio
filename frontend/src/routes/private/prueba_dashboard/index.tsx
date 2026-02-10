import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { reservationsSearchQueryOptions } from "@/hooks/reservations-queries";
import { apiClient } from "@/lib/api";
import { reservationsService } from "@/services/reservations";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  FileDown,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ReserveTypeNames,
  type ReserveTypeName,
} from "@uneg-lab/api-types/reserve-type";
import { ReservationStateNames } from "@uneg-lab/api-types/reservation";
import type { Route } from "./+types/index";

const LIMIT_PREVIEW = 8;

export async function clientLoader({
  request: { signal },
}: Route.ClientLoaderArgs) {
  return {
    stats: await reservationsService.stats(signal),
  };
}

export default function PruebaDashboard({ loaderData }: Route.ComponentProps) {
  const { stats } = loaderData;
  const [activeTab, setActiveTab] = useState<
    "todas" | "clase" | "evento" | "mantenimiento"
  >("todas");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const typeFilter = useMemo((): ReserveTypeName | undefined => {
    if (activeTab === "clase") return ReserveTypeNames.CLASE;
    if (activeTab === "evento") return ReserveTypeNames.EVENTO;
    if (activeTab === "mantenimiento") return ReserveTypeNames.MANTENIMIENTO;
    return undefined;
  }, [activeTab]);

  const stateFilter = useMemo(
    () => (filterEstado === "todos" ? undefined : filterEstado),
    [filterEstado],
  );

  const reservationQueryParams = useMemo(
    () => ({
      page: 1,
      limit: LIMIT_PREVIEW,
      type: typeFilter,
      state: stateFilter,
    }),
    [typeFilter, stateFilter],
  );

  const reservasQuery = useQuery(
    reservationsSearchQueryOptions(reservationQueryParams),
  );

  return (
    <div className="space-y-6">
      <header className="flex h-14 items-center justify-between border-b bg-[#1e293b] px-4 text-white">
        <h1 className="text-lg font-semibold">Dashboard principal</h1>
        <div className="flex items-center gap-3">
          <Code className="size-5" />
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
            DB
          </div>
        </div>
      </header>

      <main className="space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold">Panel de Administración</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Sistema de Reservas Laboratorio UNEG
          </p>
        </div>

        {/* Statistics Cards - 5 cards: Pendientes, Aprobadas, Rechazadas, Canceladas, Total */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="size-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Pendientes</p>
                  <p className="text-2xl font-bold">{stats.pendientes}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Aprobadas</p>
                  <p className="text-2xl font-bold">{stats.aprobadas}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="size-6 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Rechazadas</p>
                  <p className="text-2xl font-bold">{stats.rechazadas}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100">
                  <XCircle className="size-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Canceladas</p>
                  <p className="text-2xl font-bold">{stats.canceladas}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
          </>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Gestión de Reservas</CardTitle>
                <CardDescription>
                  Revisa y gestiona todas las solicitudes de reserva
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={filterEstado}
                  onValueChange={setFilterEstado}
                  disabled
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value={ReservationStateNames.PENDIENTE}>
                      Pendiente
                    </SelectItem>
                    <SelectItem value={ReservationStateNames.APROBADO}>
                      Aprobada
                    </SelectItem>
                    <SelectItem value={ReservationStateNames.RECHAZADO}>
                      Rechazada
                    </SelectItem>
                    <SelectItem value={ReservationStateNames.CANCELADO}>
                      Cancelada
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const blob = await apiClient.get("dashboard/pdf").blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "reservas-uneg.pdf";
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      window.open("/api/dashboard/pdf", "_blank");
                    }
                  }}
                >
                  <FileDown className="size-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={activeTab}
              onValueChange={(value) => {
                if (value) setActiveTab(value as typeof activeTab);
              }}
              variant="outline"
            >
              <ToggleGroupItem value="todas">Todas</ToggleGroupItem>
              <ToggleGroupItem value="clase">Clase</ToggleGroupItem>
              <ToggleGroupItem value="evento">Evento</ToggleGroupItem>
              <ToggleGroupItem value="mantenimiento">
                Mantenimiento
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Se muestran como máximo {LIMIT_PREVIEW} solicitudes. El total
                por estado aparece en las tarjetas de arriba.
              </p>
              {reservasQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="border">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="size-4 rounded-full" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-3 w-64" />
                            <div className="flex flex-wrap gap-3">
                              <Skeleton className="h-3 w-40" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="size-8 rounded-full" />
                              <Skeleton className="size-8 rounded-full" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                reservasQuery.data?.data.map((reserva) => (
                  <Card key={reserva.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground size-4 shrink-0" />
                            <span className="font-semibold">
                              {reserva.name ?? "Sin título"}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {reserva.type?.name}
                          </p>
                          <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-4 shrink-0" />
                              {reserva.laboratory?.name ??
                                "Laboratorio sin asignar"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-4 shrink-0" />
                              {reserva.startDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/reservas/${reserva.id}`}>
                                Ver detalles
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                              aria-label="Aprobar"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              aria-label="Rechazar"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            reserva.state?.name === "PENDIENTE"
                              ? "shrink-0 border-orange-300 bg-orange-100 text-orange-700"
                              : reserva.state?.name === "APROBADO"
                                ? "shrink-0 border-green-300 bg-green-100 text-green-700"
                                : "shrink-0"
                          }
                        >
                          {(reserva.state?.name ?? "—").toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <div className="flex justify-center pt-2">
                <Button asChild variant="secondary">
                  <Link to="/prueba-dashboard/solicitudes">
                    Ver más detalles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
