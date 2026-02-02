import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/utils";
import { reservationsService } from "@/services/reservations";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ReservationTypeNames } from "@uneg-lab/api-types/reservation";
import {
  Beaker,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  X,
  Filter,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { getAccessToken } from "@/lib/auth";

const PAGE_SIZE = 5;

// Mapeo de IDs de estado según tu lógica (2: Aprobado, 3: Cancelado/Rechazado)
const STATUS_IDS = {
  APROBADO: 2,
  RECHAZADO: 3,
};

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(start?: string, end?: string) {
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return "—";
}

export function ReservationsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [typeActivity, setTypeActivity] = useState<
    "CLASE" | "EVENTO" | "MANTENIMIENTO" | ""
  >("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ["reservations", { search, typeActivity, statusFilter, page }],
    queryFn: () =>
      reservationsService.search({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
        type: typeActivity || undefined,
        state: statusFilter || undefined,
      }),
  });

  const total = data.meta?.totalItems ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const pageData = data?.data ?? [];

  React.useEffect(() => {
    if (total > 0 && (page - 1) * PAGE_SIZE >= total) {
      setPage(1);
    }
  }, [total, page]);

  const updateReservationStatus = async (
    id: number,
    currentStatus: string,
    nextStatusId: number,
  ) => {
    const actionLabel =
      nextStatusId === STATUS_IDS.APROBADO ? "aprobar" : "cancelar";

    if (currentStatus === "APROBADO" && nextStatusId === STATUS_IDS.APROBADO)
      return;
    if (currentStatus === "RECHAZADO" && nextStatusId === STATUS_IDS.RECHAZADO)
      return;

    try {
      const token = await getAccessToken();
      const response = await fetch(
        `${import.meta.env.VITE_HOSTNAME_BACKEND}/api/reservations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stateId: nextStatusId }),
        },
      );

      if (!response.ok) throw new Error();

      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert(
        `Se ${actionLabel === "aprobar" ? "aprobó" : "canceló"} exitosamente`,
      );
    } catch (e) {
      alert(`Ocurrió un error al intentar ${actionLabel} la solicitud`);
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1e232e]">
        <label className="relative flex h-10 min-w-[320px] items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#616f89]">
            <Search className="size-4" />
          </div>
          <Input
            placeholder="Buscar por profesor, laboratorio o solicitud..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </label>

        <div className="flex items-center gap-2">
          {/* Menú Tipo de Actividad */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 shadow-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              Actividad: {typeActivity || "Todas"}
              <ChevronRight className="size-4 rotate-90 text-gray-400" />
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800">
              <div className="py-1">
                {["", "CLASE", "EVENTO", "MANTENIMIENTO"].map((type) => (
                  <MenuItem key={type}>
                    <button
                      onClick={() => {
                        setTypeActivity(type as any);
                        setPage(1);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      {type || "Todas"}
                    </button>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          {/* Menú Estado de Reserva */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 shadow-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              Estado: {statusFilter || "Todos"}
              <Filter className="size-4 text-gray-400" />
            </MenuButton>
            <MenuItems className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800">
              <div className="py-1">
                {["", "PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"].map(
                  (status) => (
                    <MenuItem key={status}>
                      <button
                        onClick={() => {
                          setStatusFilter(status);
                          setPage(1);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        {status || "Todos"}
                      </button>
                    </MenuItem>
                  ),
                )}
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm dark:border-gray-700 dark:bg-[#1e232e]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profesor</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Laboratorio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length > 0 ? (
                pageData.map((r) => (
                  <TableRow
                    key={r.id}
                    className="group transition-colors hover:bg-[#f8f9fa] dark:hover:bg-gray-800/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700 dark:bg-gray-700 dark:text-slate-200">
                          {getInitials(r.user?.name ?? "")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111318] dark:text-white">
                            {r.user?.name}
                          </p>
                          <p className="text-xs text-[#616f89]">
                            {r.user?.email?.split("@")[1] || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#616f89] dark:text-gray-300">
                      <div className="w-62 truncate">{r.name ?? "—"}</div>
                    </TableCell>
                    <TableCell className="w-32 truncate text-sm text-[#616f89] dark:text-gray-300">
                      {r.type?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-[#616f89] dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Beaker className="size-4 text-gray-400" />
                        {r.laboratory?.name ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#616f89] dark:text-gray-300">
                      {formatDate(r.startDate)}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-[#616f89] dark:bg-gray-800 dark:text-gray-300">
                        {formatTime(r.defaultStartTime, r.defaultEndTime)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* Lógica de colores de estado simplificada */}
                      {(() => {
                        const status = r.state?.name;
                        let styles =
                          "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
                        let dot = "bg-gray-500";

                        if (status === ReservationTypeNames.PENDIENTE) {
                          styles =
                            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
                          dot = "bg-amber-500";
                        } else if (status === ReservationTypeNames.APROBADO) {
                          styles =
                            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
                          dot = "bg-emerald-500";
                        } else if (status === ReservationTypeNames.RECHAZADO) {
                          styles =
                            "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400";
                          dot = "bg-red-500";
                        }

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}
                          >
                            <span className={`size-1.5 rounded-full ${dot}`} />
                            {status || "—"}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                        >
                          <Link
                            to={`/reservas/${r.id}`}
                            aria-label="Ver detalles"
                          >
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateReservationStatus(
                              r.id,
                              r.state!.name,
                              STATUS_IDS.APROBADO,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateReservationStatus(
                              r.id,
                              r.state!.name,
                              STATUS_IDS.RECHAZADO,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-medium text-[#616f89]">
                        No hay resultados para los filtros aplicados
                      </p>
                      {(typeActivity || statusFilter || search) && (
                        <Button
                          variant="link"
                          className="text-xs text-blue-500"
                          onClick={() => {
                            setTypeActivity("");
                            setStatusFilter("");
                            setSearch("");
                          }}
                        >
                          Limpiar todos los filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-[#dbdfe6] bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-[#1e232e]">
          <div className="text-sm text-[#616f89] dark:text-gray-400">
            Mostrando{" "}
            <span className="font-medium text-[#111318] dark:text-white">
              {from}
            </span>{" "}
            a{" "}
            <span className="font-medium text-[#111318] dark:text-white">
              {to}
            </span>{" "}
            de{" "}
            <span className="font-medium text-[#111318] dark:text-white">
              {total}
            </span>{" "}
            solicitudes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-lg p-2"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-lg p-2"
              onClick={() =>
                setPage((p) => (p * PAGE_SIZE < total ? p + 1 : p))
              }
              disabled={page * PAGE_SIZE >= total}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
