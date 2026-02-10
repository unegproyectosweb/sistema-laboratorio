import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api";
import { ReservationSchema } from "@uneg-lab/api-types/reservation.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { Await, Link, useLoaderData } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 8;

export async function clientLoader({
  request: { signal },
}: {
  request: { signal: AbortSignal };
}) {
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
    payload: apiClient
      .get(`dashboard/reservations?${params.toString()}`, { signal })
      .json()
      .then((r: { data: unknown[]; total: number }) => ({
        data: r.data.map((x) => ReservationSchema.parse(x)),
        total: r.total,
      })),
  };
}

export default function SolicitudesDashboard() {
  const loaderData = useLoaderData() as {
    page: number;
    estado: string;
    payload: Promise<{ data: Array<{ id: number; nombre: string; fecha: string; estado: string; descripcion: string }>; total: number }>;
  };
  const currentPage = loaderData.page;

  return (
    <section className="space-y-4 p-4">
      <header>
        <CardTitle className="text-xl">Solicitudes de reserva</CardTitle>
        <CardDescription>
          Tabla de solicitudes (máximo {PAGE_SIZE} por vista). Usa el botón
          &quot;Ver más detalles&quot; en el dashboard para volver al resumen.
        </CardDescription>
      </header>

      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Await resolve={loaderData.payload}>
          {({ data, total }) => {
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            const hasPrev = currentPage > 1;
            const hasNext = currentPage < totalPages;

            return (
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
                      {data.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.id}</TableCell>
                          <TableCell className="font-medium">
                            {r.nombre}
                          </TableCell>
                          <TableCell>{r.fecha}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                r.estado === "Pendiente"
                                  ? "bg-orange-100 text-orange-700 border-orange-300"
                                  : r.estado === "Aprobada"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : ""
                              }
                            >
                              {r.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {r.descripcion}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="link" size="sm">
                              <Link to={`/reservas/${r.id}`}>Ver detalles</Link>
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
                        <Link
                          to={`/prueba-dashboard/solicitudes?page=${currentPage - 1}${loaderData.estado !== "todos" ? `&estado=${loaderData.estado}` : ""}`}
                        >
                          <ChevronLeft className="size-4" />
                          Anterior
                        </Link>
                      ) : (
                        <span>
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
                        <Link
                          to={`/prueba-dashboard/solicitudes?page=${currentPage + 1}${loaderData.estado !== "todos" ? `&estado=${loaderData.estado}` : ""}`}
                        >
                          Siguiente
                          <ChevronRight className="size-4" />
                        </Link>
                      ) : (
                        <span>
                          Siguiente
                          <ChevronRight className="size-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>

      <p className="text-muted-foreground text-sm">
        <Link to="/prueba-dashboard" className="underline">
          ← Volver al Panel de Administración
        </Link>
      </p>
    </section>
  );
}
