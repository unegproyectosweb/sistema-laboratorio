import { StatsCards } from "@/components/dashboard/stats-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateReservationState } from "@/hooks/use-update-reservation-state";
import { useUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { reservationsService } from "@/services/reservations";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { RoleEnum } from "@uneg-lab/api-types/auth";
import {
  ReservationStateEnum,
  type Reservation,
  ReservationStateNames as ReservationStates,
} from "@uneg-lab/api-types/reservation";
import {
  ReserveTypeNames,
  type ReserveTypeName,
} from "@uneg-lab/api-types/reserve-type";
import { capitalize } from "lodash-es";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  Loader2,
  MapPinIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/dashboard";

const reserveTypeTabs = [
  { label: "Todas", value: null },
  { label: "Clase", value: ReserveTypeNames.CLASE },
  { label: "Evento", value: ReserveTypeNames.EVENTO },
  { label: "Mantenimiento", value: ReserveTypeNames.MANTENIMIENTO },
];

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
  const [activeTab, setActiveTab] = useState<ReserveTypeName | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { user } = useUser();
  const isAdmin = user?.role === RoleEnum.ADMIN;

  const { data: stats } = useSuspenseQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => reservationsService.stats(),
  });

  const {
    data: recent,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: [
      "dashboard",
      "recentReservations",
      { state: selectedState, type: activeTab },
    ],
    queryFn: ({ pageParam }) =>
      reservationsService.search({
        limit: 20,
        page: pageParam,
        state: selectedState ?? undefined,
        type: activeTab ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.totalPages
        ? lastPage.meta.currentPage + 1
        : undefined,
  });

  const { mutate: changeState } = useUpdateReservationState();

  const filteredReservas = recent?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-linear-to-br from-gray-50 to-gray-100 p-6 dark:from-[#0f1720] dark:to-[#1e232e]">
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
                {reserveTypeTabs.map((tab) => (
                  <button
                    key={tab.value ?? "all"}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors md:px-4",
                      activeTab === tab.value
                        ? "border-accent-foreground text-accent-foreground border-b-2"
                        : "hover:text-accent-foreground text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Estados
                selectedState={selectedState}
                setSelectedState={setSelectedState}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="border border-slate-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredReservas.length > 0 ? (
              filteredReservas.map((reserva) => (
                <CardReserva
                  key={reserva.id}
                  reserva={reserva}
                  isAdmin={isAdmin}
                  onApprove={() =>
                    changeState({
                      id: reserva.id,
                      stateId: ReservationStateEnum.APROBADO,
                    })
                  }
                  onReject={() =>
                    changeState({
                      id: reserva.id,
                      stateId: ReservationStateEnum.RECHAZADO,
                    })
                  }
                />
              ))
            ) : (
              <div className="text-muted-foreground flex h-32 items-center justify-center">
                No se encontraron reservas
              </div>
            )}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Ver más"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Estados({
  selectedState,
  setSelectedState,
}: {
  selectedState: string | null;
  setSelectedState: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const options = Object.values(ReservationStates);

  function label(s: string | null) {
    if (!s) return "Todos los estados";
    return capitalize(s);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">{label(selectedState)} ▼</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Estados
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={selectedState ?? ""}
          onValueChange={(v) => setSelectedState(v || null)}
        >
          <DropdownMenuRadioItem value="">
            Todos los estados
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt} value={opt}>
              {label(opt)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CardReserva({
  reserva,
  isAdmin,
  onApprove,
  onReject,
}: {
  reserva: Reservation;
  isAdmin: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = reserva.state?.name === ReservationStates.PENDIENTE;

  return (
    <Card className="border-border border p-3 transition-all hover:border-slate-300 md:p-4 dark:hover:border-slate-700">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {reserva.user?.name ?? reserva.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-100"
            >
              {reserva.state?.name}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{reserva.name}</p>

          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
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
          {isAdmin && isPending && (
            <>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700"
                title="Aprobar"
                onClick={onApprove}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-full border-red-300 text-red-600 hover:bg-red-50"
                title="Rechazar"
                onClick={onReject}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            asChild
            size="icon"
            variant="outline"
            className="h-9 w-9 rounded-full border-slate-300 hover:bg-slate-100"
            title="Ver detalles"
          >
            <Link to={`/reservas/${reserva.id}`} aria-label="Ver detalles">
              <EyeIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
