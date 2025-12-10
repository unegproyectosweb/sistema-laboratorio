import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import type { Route } from "./+types/dashboard";

// Datos de ejemplo - esto vendría de tu API
const mockStats = {
  pendientes: 12,
  aprobadas: 60,
  rechazadas: 5,
  total: 77,
};

type TabType = "Todas" | "Semestral" | "Evento" | "Especial";

export function clientLoader(_: Route.LoaderArgs) {
  const mockReservas = [
    {
      id: 1,
      profesor: "Prof. Carlos Jiménez",
      materia: "Programación I",
      laboratorio: "Laboratorio de Computación",
      fechaInicio: "10/09/2025",
      fechaFin: "20/12/2025",
      horario: "8:00 - 10:00",
      estado: "Pendiente",
      tipo: "Semestral",
    },
    {
      id: 2,
      profesor: "Prof. Sandra Martínez",
      materia: "Física II",
      laboratorio: "Laboratorio de Computación",
      fechaInicio: "10/09/2025",
      fechaFin: "20/12/2025",
      horario: "8:00 - 10:00",
      estado: "Pendiente",
      tipo: "Semestral",
    },
    {
      id: 3,
      profesor: "Prof. Juan Rodríguez",
      materia: "Programación I",
      laboratorio: "Laboratorio de Computación",
      fechaInicio: "10/09/2025",
      fechaFin: "20/12/2025",
      horario: "8:00 - 10:00",
      estado: "Pendiente",
      tipo: "Semestral",
    },
    {
      id: 4,
      profesor: "Prof. Marta Coro",
      materia: "Programación I",
      laboratorio: "Laboratorio de Computación",
      fechaInicio: "10/09/2025",
      fechaFin: "20/12/2025",
      horario: "8:00 - 10:00",
      estado: "Pendiente",
      tipo: "Semestral",
    },
  ];
  return { reservas: mockReservas };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { reservas } = loaderData;
  const [activeTab, setActiveTab] = useState<TabType>("Todas");

  const filteredReservas =
    activeTab === "Todas"
      ? reservas
      : reservas.filter((r) => r.tipo === activeTab);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Pendientes
              </CardTitle>
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {mockStats.pendientes}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Aprobadas
              </CardTitle>
              <CheckCircle2Icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStats.aprobadas}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Rechazadas
              </CardTitle>
              <XCircleIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockStats.rechazadas}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Total
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {mockStats.total}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Reservas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Gestión de Reservas
              </CardTitle>
              <span className="text-sm text-slate-500">
                Revisa y gestiona todas las solicitudes de reserva
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pt-4">
              {(["Todas", "Semestral", "Evento", "Especial"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-slate-900 text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
              <div className="ml-auto">
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Todos los estados ▼
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {filteredReservas.map((reserva) => (
              <Card
                key={reserva.id}
                className="border border-slate-200 transition-all hover:border-slate-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {reserva.profesor}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                        >
                          {reserva.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {reserva.materia}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{reserva.laboratorio}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {reserva.fechaInicio} - {reserva.fechaFin}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{reserva.horario}</span>
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
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
