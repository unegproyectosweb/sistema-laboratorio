import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reservationsSearchQueryOptions } from "@/hooks/reservations-queries";
import { useQuery } from "@tanstack/react-query";
import { ReservationStateNames } from "@uneg-lab/api-types/reservation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link, NavLink } from "react-router";
import type { Route } from "./+types/solicitudes";

const PAGE_SIZE = 8;

export async function clientLoader({ request }: Route.ClientActionArgs) {
  const { signal } = request;
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const estado = url.searchParams.get("estado") ?? undefined;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (estado) params.set("estado", estado);
  return {
    page,
    estado: estado ?? "todos",
    signal,
  };
}

export default function SolicitudesDashboard({
  loaderData,
}: Route.ComponentProps) {
  const currentPage = loaderData.page;
  const { data, isLoading } = useQuery(
    reservationsSearchQueryOptions({
      page: currentPage,
      limit: PAGE_SIZE,
      state: loaderData.estado === "todos" ? undefined : loaderData.estado,
    }),
  );
  const total = data?.meta.totalItems ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <section className="space-y-4 p-4">
      <header>
        <CardTitle className="text-xl">Solicitudes de reserva</CardTitle>
        <CardDescription>
          Tabla de solicitudes (máximo {PAGE_SIZE} por vista). Usa el botón
          &quot;Ver más detalles&quot; en el dashboard para volver al resumen.
        </CardDescription>
      </header>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell className="font-medium">
                      {r.name ?? "Sin título"}
                    </TableCell>
                    <TableCell>{r.startDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          r.state?.name === ReservationStateNames.PENDIENTE
                            ? "border-orange-300 bg-orange-100 text-orange-700"
                            : r.state?.name === ReservationStateNames.APROBADO
                              ? "border-green-300 bg-green-100 text-green-700"
                              : ""
                        }
                      >
                        {(r.state?.name ?? "—").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      {r.type?.name ?? "Sin descripción"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="link" size="sm">
                        <NavLink to={`/reservas/${r.id}`}>
                          {({ isPending }) => (
                            <span className="inline-flex items-center">
                              Ver detalles
                              {isPending && (
                                <Loader2 className="ml-2 size-4 animate-spin" />
                              )}
                            </span>
                          )}
                        </NavLink>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Página {currentPage} de {totalPages} ({total} solicitudes)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                asChild={hasPrev}
              >
                {hasPrev ? (
                  <NavLink
                    to={`?page=${currentPage - 1}${loaderData.estado !== "todos" ? `&estado=${loaderData.estado}` : ""}`}
                  >
                    {({ isPending }) => (
                      <span className="inline-flex items-center gap-1">
                        <ChevronLeft className="size-4" />
                        Anterior
                        {isPending && (
                          <Loader2 className="ml-1 size-4 animate-spin" />
                        )}
                      </span>
                    )}
                  </NavLink>
                ) : (
                  <span className="flex items-center gap-1">
                    <ChevronLeft className="size-4" />
                    Anterior
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext}
                asChild={hasNext}
              >
                {hasNext ? (
                  <NavLink
                    to={`?page=${currentPage + 1}${loaderData.estado !== "todos" ? `&estado=${loaderData.estado}` : ""}`}
                  >
                    {({ isPending }) => (
                      <span className="inline-flex items-center gap-1">
                        Siguiente
                        <ChevronRight className="size-4" />
                        {isPending && (
                          <Loader2 className="ml-1 size-4 animate-spin" />
                        )}
                      </span>
                    )}
                  </NavLink>
                ) : (
                  <span className="flex items-center gap-1">
                    Siguiente
                    <ChevronRight className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        <Link to="/prueba-dashboard" className="underline">
          ← Volver al Panel de Administración
        </Link>
      </p>
    </section>
  );
}
