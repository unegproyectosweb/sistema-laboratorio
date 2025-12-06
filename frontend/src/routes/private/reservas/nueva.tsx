import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { Route } from "./+types";

const UNAVAILABLE_SLOTS: Record<string, string[]> = {
  // Example: 2025-12-03 has some unavailable hours
  "2025-12-03": ["09:00", "11:00", "13:00"],
  "2025-12-04": ["10:00"],
};

function toIso(date?: Date | null) {
  if (!date) return undefined;
  // Keep timezone-independent date key YYYY-MM-DD
  return format(date, "yyyy-MM-dd");
}

export default function NuevaReserva(_: Route.ComponentProps) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [hour, setHour] = useState("06");
  const [minute, setMinute] = useState("30");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const selectedKey = useMemo(() => toIso(selected), [selected]);
  const unavailable = useMemo(
    () => (selectedKey ? (UNAVAILABLE_SLOTS[selectedKey] ?? []) : []),
    [selectedKey],
  );

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
    [],
  );
  const minutes = ["00", "15", "30", "45"];

  const canReserve = useMemo(
    () => selected && !!hour && !!minute,
    [selected, hour, minute],
  );

  const onReserve = useCallback(() => {
    if (!canReserve)
      return alert("Por favor seleccione una fecha y hora válidas");
    const start = `${hour}:${minute}`;
    if (unavailable.includes(start)) {
      alert("La hora seleccionada está en la lista de horas no disponibles");
      return;
    }

    const payload = {
      date: selectedKey,
      start,
      description,
    };

    // TODO: Replace with actual API call
    console.log("Reservación enviada:", payload);
    navigate("/reservas");
  }, [
    canReserve,
    description,
    hour,
    minute,
    navigate,
    selectedKey,
    unavailable,
  ]);

  return (
    <section>
      <header className="flex items-center justify-between gap-3 p-3">
        <div>
          <CardTitle className="text-lg">Calendario de reservas</CardTitle>
          <CardDescription>
            Selecciona un día para ver la disponibilidad
          </CardDescription>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 p-3 md:grid-cols-[380px_1fr]">
        <Card className="px-4 py-3">
          <CardContent className="p-0">
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm">No disponible</span>
              </div>
            </div>
            <div>
              <Calendar
                mode="single"
                selected={selected}
                onSelect={(d: Date | undefined) => setSelected(d)}
                defaultMonth={new Date()}
              />
            </div>
            <p className="text-destructive mt-2 text-xs">
              Nota: Las reservas duran 2 horas para dar clases
            </p>
          </CardContent>
        </Card>

        <div className="p-3">
          <div className="mb-4">
            <Card className="rounded-md">
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold">
                    {selected
                      ? `Seleccionaste ${format(selected, "dd 'de' MMMM yyyy")}`
                      : "Selecciona una fecha"}
                  </div>
                  {selectedKey ? (
                    <div className="text-muted-foreground text-xs">
                      {unavailable.length ? (
                        <>
                          <div className="font-semibold text-red-700">
                            Horas de reservas no disponibles
                          </div>
                          <div className="text-sm">
                            {unavailable.join(" - ")}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm">
                          No hay horarios no disponibles para este día
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 grid grid-cols-2 items-end gap-3">
            <div>
              <Label>Hora</Label>
              <Select onValueChange={(v) => setHour(v)}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Minuto</Label>
              <Select onValueChange={(v) => setMinute(v)}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Label>Escribe una descripción del motivo de reserva</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Separator className="my-2" />

          <div className="mt-4 flex justify-end gap-4">
            <Button asChild variant="destructive">
              <Link to="/reservas">Cancelar</Link>
            </Button>
            <Button onClick={onReserve} variant="default">
              Reservar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
