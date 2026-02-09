import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { laboratoriesService } from "@/services/laboratories";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Filter, Search } from "lucide-react";
import { startTransition } from "react";

type ActivityType = "CLASE" | "EVENTO" | "MANTENIMIENTO" | "";

type ReservationsFiltersProps = {
  typeActivity: ActivityType;
  statusFilter: string;
  laboratoryId: number | null;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onTypeChange: (value: ActivityType) => void;
  onStatusChange: (value: string) => void;
  onLaboratoryChange: (value: number | null) => void;
  onClearFilters: () => void;
};

export function ReservationsFilters({
  typeActivity,
  statusFilter,
  laboratoryId,
  onSearchChange,
  onSearchSubmit,
  onTypeChange,
  onStatusChange,
  onLaboratoryChange,
  onClearFilters,
}: ReservationsFiltersProps) {
  const { data: laboratories = [] } = useQuery({
    queryKey: ["laboratories"],
    queryFn: () => laboratoriesService.getAll(),
  });

  const selectedLaboratoryName =
    laboratoryId != null
      ? laboratories.find((lab) => lab.id === laboratoryId)?.name
      : null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dbdfe6] bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1e232e]">
      <label className="relative flex h-10 min-w-[320px] items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#616f89]">
          <Search className="size-4" />
        </div>
        <Input
          placeholder="Buscar por profesor, laboratorio o solicitud..."
          className="pl-10"
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
      </label>

      <div className="flex items-center gap-2">
        {/* Menú Tipo de Actividad */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="bg-gray-100 text-gray-600 shadow-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Actividad: {typeActivity || "Todas"}
              <ChevronRight className="size-4 rotate-90 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {(["", "CLASE", "EVENTO", "MANTENIMIENTO"] as ActivityType[]).map(
              (type) => (
                <DropdownMenuItem
                  key={type}
                  className={
                    type === typeActivity
                      ? "bg-slate-100 text-slate-900 dark:bg-gray-700/60 dark:text-white"
                      : undefined
                  }
                  onClick={() => {
                    onTypeChange(type);
                  }}
                >
                  {type || "Todas"}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Menú Laboratorio */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="bg-gray-100 text-gray-600 shadow-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Laboratorio: {selectedLaboratoryName || "Todos"}
              <ChevronRight className="size-4 rotate-90 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              className={
                laboratoryId == null
                  ? "bg-slate-100 text-slate-900 dark:bg-gray-700/60 dark:text-white"
                  : undefined
              }
              onClick={() => {
                if (laboratoryId == null) return;
                startTransition(() => {
                  onLaboratoryChange(null);
                });
              }}
            >
              Todos
            </DropdownMenuItem>
            {laboratories.map((lab) => (
              <DropdownMenuItem
                key={lab.id}
                className={
                  laboratoryId === lab.id
                    ? "bg-slate-100 text-slate-900 dark:bg-gray-700/60 dark:text-white"
                    : undefined
                }
                onClick={() => {
                  if (laboratoryId === lab.id) return;
                  startTransition(() => {
                    onLaboratoryChange(lab.id);
                  });
                }}
              >
                {lab.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Menú Estado de Reserva */}{" "}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="bg-gray-100 text-gray-600 shadow-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Estado: {statusFilter || "Todos"}
              <Filter className="size-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {["", "PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"].map(
              (status) => (
                <DropdownMenuItem
                  key={status}
                  className={
                    status === statusFilter
                      ? "bg-slate-100 text-slate-900 dark:bg-gray-700/60 dark:text-white"
                      : undefined
                  }
                  onClick={() => {
                    onStatusChange(status);
                  }}
                >
                  {status || "Todos"}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="link"
          className="text-xs text-blue-500"
          onClick={onClearFilters}
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
