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
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";
import { getAccessToken } from "@/lib/auth";

const PAGE_SIZE = 5;

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

  const { data } = useSuspenseQuery({
    queryKey: [
      "reservations",
      { search: search, typeActivity: typeActivity, page },
    ],
    queryFn: () =>
      reservationsService.search({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
        type: typeActivity || undefined,
      }),
  });

  const queryClient = useQueryClient();
  const total = data.meta?.totalItems ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const pageData = data?.data ?? [];

  React.useEffect(() => {
    if (total > 0 && (page - 1) * PAGE_SIZE >= total) {
      setPage(1);
    }
  }, [total, page]);
  function prev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function next() {
    setPage((p) => (p * PAGE_SIZE < total ? p + 1 : p));
  }

  const filteredData = pageData.filter(
    (r) => typeActivity === "" || r.type?.name === typeActivity,
  );

  const cancelledReservation = async (id: number, name: string) => {
    if (name === "RECHAZADO") return;
    try {
      const token = await getAccessToken();
      await fetch(`http://localhost:3000/api/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stateId: 3,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert(" Se cancelo exitosamente");
    } catch (e: any) {
      alert("Ocurrio un error en cancelar la solicitud");
      console.log(e);
    }
  };

  const aprovedReservation = async (id: number, name: string) => {
    if (name === "APROBADO") return;
    try {
      const token = await getAccessToken();
      await fetch(`http://localhost:3000/api/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stateId: 2,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert(" Se aprobo exitosamente");
    } catch (e: any) {
      alert("Ocurrio un error en aprobar la solicitud");
      console.log(e);
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

        <div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 shadow-xs hover:bg-gray-200">
                Tipo de actividad
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="-mr-1 size-5 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 opacity-80 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <div
                    onClick={() => {
                      setTypeActivity("");
                      setPage(1);
                    }}
                    className="block cursor-pointer px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white"
                  >
                    Todos
                  </div>
                </MenuItem>

                <MenuItem>
                  <div
                    onClick={() => {
                      setTypeActivity("CLASE");
                      setPage(1);
                    }}
                    className="block cursor-pointer px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white"
                  >
                    Clase
                  </div>
                </MenuItem>

                <MenuItem>
                  <div
                    onClick={() => {
                      setTypeActivity("EVENTO");
                      setPage(1);
                    }}
                    className="block cursor-pointer px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white"
                  >
                    Evento
                  </div>
                </MenuItem>
                <MenuItem>
                  <div
                    onClick={() => {
                      setTypeActivity("MANTENIMIENTO");
                      setPage(1);
                    }}
                    className="block cursor-pointer px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white"
                  >
                    Mantenimiento
                  </div>
                </MenuItem>
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
              {filteredData.length > 0 ? (
                filteredData.map((r) => (
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
                            {r.user?.email ? r.user.email.split("@")[1] : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-[#616f89] dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        {r.name ?? "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-[#616f89] dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        {r.type?.name ?? "—"}
                      </div>
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
                    <TableCell className="w-fit rounded bg-gray-100 px-2 py-1 font-mono text-xs text-[#616f89] dark:bg-gray-800 dark:text-gray-300">
                      {formatTime(r.defaultStartTime, r.defaultEndTime)}
                    </TableCell>
                    <TableCell>
                      {r.state?.name === ReservationTypeNames.PENDIENTE ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          {r.state.name}
                        </span>
                      ) : r.state?.name === ReservationTypeNames.APROBADO ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {r.state.name}
                        </span>
                      ) : r.state?.name === ReservationTypeNames.RECHAZADO ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <span className="size-1.5 rounded-full bg-red-500" />
                          {r.state.name}
                        </span>
                      ) : r.state?.name === ReservationTypeNames.CANCELADO ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          <span className="size-1.5 rounded-full bg-gray-500" />
                          {r.state.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-lg border-slate-300 hover:bg-slate-100"
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
                          onClick={() => {
                            aprovedReservation(r.id, r.state!.name);
                          }}
                          className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            cancelledReservation(r.id, r.state!.name);
                          }}
                          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
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
                        No hay ninguna actividad que coincida con la búsqueda
                      </p>
                      {typeActivity && (
                        <Button
                          variant="link"
                          className="text-xs text-blue-500"
                          onClick={() => setTypeActivity("")}
                        >
                          Limpiar filtros de actividad
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
              onClick={prev}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-lg p-2"
              onClick={next}
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
