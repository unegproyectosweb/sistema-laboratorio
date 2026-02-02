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
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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
import { useUser } from "@/lib/auth";
import { RoleEnum } from "@uneg-lab/api-types/auth";

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
  const { user } = useUser();
  const isAdmin = user?.role === RoleEnum.ADMIN;
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery({
    queryKey: ["reservations", { search, page }],
    queryFn: () =>
      reservationsService.search({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const { mutate: changeState } = useMutation({
    mutationFn: ({ id, stateId }: { id: number; stateId: number }) =>
      reservationsService.updateState(id, stateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const total = data.meta?.totalItems ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const pageData = data?.data ?? [];

  // Ensure page stays valid when total shrinks
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
      </div>
      <div className="overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-sm dark:border-gray-700 dark:bg-[#1e232e]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profesor</TableHead>
                <TableHead>Laboratorio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((r) => (
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
                      {isAdmin &&
                        r.state?.name === ReservationTypeNames.PENDIENTE && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                              onClick={() =>
                                changeState({ id: r.id, stateId: 2 })
                              }
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                              onClick={() =>
                                changeState({ id: r.id, stateId: 3 })
                              }
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
