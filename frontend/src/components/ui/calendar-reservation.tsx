import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useEffectEvent, useState } from "react";
import { Calendar } from "./calendar";

interface Props {
  obtainDate: (selectedDate: string) => void;
}

function CalendarReservation({ obtainDate }: Props) {
  const [selected, setSelected] = useState<Date>();

  const today = new Date();
  const endOfYear = new Date(today.getFullYear(), 11);

  const handleDateChange = useEffectEvent((text: string) => {
    obtainDate(text);
  });

  useEffect(() => {
    if (selected) {
      const DateFormat = format(selected, "d 'de' MMMM yyyy", { locale: es });
      handleDateChange("Seleccionaste " + DateFormat);
    }
  }, [selected]);

  return (
    <Calendar
      locale={es}
      animate
      mode="single"
      className="w-8/10 rounded-lg border shadow-sm"
      selected={selected}
      onSelect={setSelected}
      startMonth={today} // empieza desde el mes actual
      endMonth={endOfYear} // termina en diciembre del año actual
      disabled={[
        new Date(2025, 11, 11), //dia 11 para mostrar no disponible de reserva full
        { before: new Date() }, // deshabilita los dias anteriores a hoy
        { dayOfWeek: [0, 6] }, // deshabilita los fines de semana (0 es domingo, 6 es sábado)
      ]} // es clave para desactivar cuando este full una reserva se transformara en un array posteriormente
      modifiers={{ booked: new Date(2025, 11, 11) }} // selecciona el ano - fecha - dia a modificar
      modifiersClassNames={{
        // estilos para dias modificados
        booked: cn(
          "rounded-lg border opacity-100! *:opacity-100!",
          "after:absolute after:top-0 after:right-0 after:translate-x-1/4 after:-translate-y-1/4 after:size-2 after:rounded-full after:bg-[#FF600B] after:content-['']",
        ),
      }}
      showOutsideDays
      required
    />
  );
}

export default CalendarReservation;
