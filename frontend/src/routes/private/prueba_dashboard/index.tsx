import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { apiClient } from "@/lib/api";
import { DashboardStatsSchema } from "@uneg-lab/api-types/dashboard.js";
import { ReservationSchema } from "@uneg-lab/api-types/reservation.js";
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
import { useState } from "react";
import { Await, Link, useLoaderData } from "react-router";

const LIMIT_PREVIEW = 8;

export async function clientLoader({
  request: { signal },
}: {
  request: { signal: AbortSignal };
}) {
  return {
    stats: apiClient
      .get("dashboard/stats", { signal })
      .json()
      .then(DashboardStatsSchema.parse),
    reservas: apiClient
      .get(`dashboard/reservations?page=1&limit=${LIMIT_PREVIEW}`, { signal })
      .json()
      .then((r: { data: unknown[] }) =>
        r.data.map((x) => ReservationSchema.parse(x)),
      ),
  };
}

export default function PruebaDashboard() {
  const loaderData = useLoaderData() as {
    stats: Promise<{ pendientes: number; aprobadas: number; rechazadas: number; canceladas: number; total: number }>;
    reservas: Promise<Array<{ id: number; nombre: string; fecha: string; estado: string; descripcion: string }>>;
  };
  const [activeTab, setActiveTab] = useState<
    "todas" | "clase" | "evento" | "mantenimiento"
  >("todas");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

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
          <Await resolve={loaderData.stats}>
            {(stats) => (
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
            )}
          </Await>
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Aprobada">Aprobada</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const blob = await apiClient
                        .get("dashboard/pdf")
                        .blob();
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
              <ToggleGroupItem value="mantenimiento">Mantenimiento</ToggleGroupItem>
            </ToggleGroup>

            <div className="space-y-4">
              <Await resolve={loaderData.reservas}>
                {(reservas) => (
                  <>
                    {reservas.slice(0, LIMIT_PREVIEW).map((reserva) => (
                      <Card key={reserva.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="size-4 text-muted-foreground shrink-0" />
                                <span className="font-semibold">
                                  {reserva.nombre}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {reserva.descripcion}
                              </p>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-4 shrink-0" />
                                  Sala de Computación - Villa Asia
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-4 shrink-0" />
                                  {reserva.fecha}
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
                                reserva.estado === "Pendiente"
                                  ? "bg-orange-100 text-orange-700 border-orange-300 shrink-0"
                                  : reserva.estado === "Aprobada"
                                    ? "bg-green-100 text-green-700 border-green-300 shrink-0"
                                    : "shrink-0"
                              }
                            >
                              {reserva.estado.toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex justify-center pt-2">
                      <Button asChild variant="secondary">
                        <Link to="/prueba-dashboard/solicitudes">
                          Ver más detalles
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </Await>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
