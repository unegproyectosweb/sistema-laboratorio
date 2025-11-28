import type { Route } from "./+types/[id]";

export default function ReservasPage({ params }: Route.ComponentProps) {
  const { id } = params;
  return <div>Reservas Page - ID: {id}</div>;
}
