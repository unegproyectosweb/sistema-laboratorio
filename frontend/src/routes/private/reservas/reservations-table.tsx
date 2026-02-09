import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateReservationState } from "@/hooks/use-update-reservation-state";
import { useUser } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { ReservationsFilters } from "@/routes/private/reservas/reservations-filters";
import { reservationsService } from "@/services/reservations";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { RoleEnum } from "@uneg-lab/api-types/auth";
import { ReservationStateEnum } from "@uneg-lab/api-types/reservation";
import {
  Beaker,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useDebounceValue } from "usehooks-ts";

const PAGE_SIZE = 10;

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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useDebounceValue<{
    search: string;
    typeActivity: "CLASE" | "EVENTO" | "MANTENIMIENTO" | "";
    statusFilter: string;
    laboratoryId: number | null;
  }>(
    {
      search: "",
      typeActivity: "",
      statusFilter: "",
      laboratoryId: null,
    },
    500,
  );

  const { user } = useUser();
  const isAdmin = user?.role === RoleEnum.ADMIN;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      "reservations",
      {
        search: filters.search,
        typeActivity: filters.typeActivity,
        statusFilter: filters.statusFilter,
        laboratoryId: filters.laboratoryId,
        page,
      },
    ],
    queryFn: () =>
      reservationsService.search({
        search: filters.search || undefined,
        page,
        limit: PAGE_SIZE,
        type: filters.typeActivity || undefined,
        state: filters.statusFilter || undefined,
        laboratoryId: filters.laboratoryId ?? undefined,
      }),
  });

  const { mutate: changeState } = useUpdateReservationState();

  const deleteReservation = useMutation({
    mutationFn: (id: number) => reservationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setPage(1);
    },
  });

  const total = data?.meta?.totalItems ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const pageData = data?.data ?? [];

  const updateReservationStatus = (
    id: number,
    currentStatus: string,
    nextStatusId: number,
  ) => {
    if (
      currentStatus === "APROBADO" &&
      nextStatusId === ReservationStateEnum.APROBADO
    )
      return;
    if (
      currentStatus === "RECHAZADO" &&
      nextStatusId === ReservationStateEnum.RECHAZADO
    )
      return;

    changeState({ id, stateId: nextStatusId });
  };

  return (
    <div className="space-y-4">
      <ReservationsFilters
        typeActivity={filters.typeActivity}
        statusFilter={filters.statusFilter}
        laboratoryId={filters.laboratoryId}
        onSearchChange={(value) => {
          setFilters({ ...filters, search: value });
          setPage(1);
        }}
        onSearchSubmit={() => setFilters.flush()}
        onTypeChange={(value) => {
          setFilters({ ...filters, typeActivity: value });
          setFilters.flush();
          setPage(1);
        }}
        onStatusChange={(value) => {
          setFilters({ ...filters, statusFilter: value });
          setFilters.flush();
          setPage(1);
        }}
        onLaboratoryChange={(value) => {
          setFilters({ ...filters, laboratoryId: value });
          setFilters.flush();
          setPage(1);
        }}
        onClearFilters={() => {
          setFilters({
            search: "",
            typeActivity: "",
            statusFilter: "",
            laboratoryId: null,
          });
          setFilters.flush();
          setPage(1);
        }}
      />

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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : pageData.length > 0 ? (
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
                        const stateId = r.state?.id;
                        let styles =
                          "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
                        let dot = "bg-gray-500";

                        if (stateId === ReservationStateEnum.PENDIENTE) {
                          styles =
                            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
                          dot = "bg-amber-500";
                        } else if (stateId === ReservationStateEnum.APROBADO) {
                          styles =
                            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
                          dot = "bg-emerald-500";
                        } else if (stateId === ReservationStateEnum.RECHAZADO) {
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
                        {isAdmin &&
                          r.state?.id === ReservationStateEnum.PENDIENTE && (
                            <>
                              <Button
                                size="icon-sm"
                                onClick={() =>
                                  updateReservationStatus(
                                    r.id,
                                    r.state!.name,
                                    ReservationStateEnum.APROBADO,
                                  )
                                }
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                                title="Aprobar"
                              >
                                <Check />
                              </Button>
                              <Button
                                size="icon-sm"
                                onClick={() =>
                                  updateReservationStatus(
                                    r.id,
                                    r.state!.name,
                                    ReservationStateEnum.RECHAZADO,
                                  )
                                }
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400"
                                title="Rechazar"
                              >
                                <X />
                              </Button>
                            </>
                          )}
                        <Button asChild size="icon-sm" variant="outline">
                          <Link
                            to={`/reservas/${r.id}`}
                            aria-label="Ver detalles"
                          >
                            <Eye />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            title="Eliminar"
                            onClick={() => {
                              if (!confirm("¿Eliminar esta reserva?")) return;
                              deleteReservation.mutate(r.id);
                            }}
                          >
                            <Trash2 />
                          </Button>
                        )}
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
                      {(filters.typeActivity ||
                        filters.statusFilter ||
                        filters.laboratoryId ||
                        filters.search) && (
                        <Button
                          variant="link"
                          className="text-xs text-blue-500"
                          onClick={() => {
                            setFilters({
                              search: "",
                              typeActivity: "",
                              statusFilter: "",
                              laboratoryId: null,
                            });
                            setFilters.flush();
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
