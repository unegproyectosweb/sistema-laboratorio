import z from "zod";

function requiredValue(message = "Este campo es obligatorio") {
  return (ctx: z.core.$ZodRawIssue) => {
    return ctx.input ? "Valor inválido" : message;
  };
}

const timeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const reservationFormSchemaRecurring = z
  .object({
    date: z.coerce.date({
      error: requiredValue("Inicio de semestre requerido"),
    }),
    dateFinally: z.coerce.date({
      error: requiredValue("Fin de semestre requerido"),
    }),
    start_time: z
      .string({ error: requiredValue() })
      .nonempty("La hora para empezar requerida"),
    end_time: z
      .string({ error: requiredValue() })
      .nonempty("La hora de finalizacion es requerida"),
    description: z
      .string({ error: requiredValue() })
      .nonempty("La descripcion es requerida"),
    type_event: z.coerce.number({}).positive("Selecciona un evento válido"),
    laboratorio: z.coerce
      .number({})
      .positive("Selecciona un laboratorio válido"),
    days: z.string({ error: requiredValue() }).nonempty("El dia es  requerido"),
    WeeksReservations: z
      .string({ error: requiredValue() })
      .nonempty("La frecuencia de la semana es requerida"),

    whomYouReserved: z.string({ error: requiredValue() }).optional(),
  })
  .superRefine((data, ctx) => {
    const start = timeToMinutes(data.start_time);
    const end = timeToMinutes(data.end_time);

    if (start === end) {
      const message = "La hora de inicio y fin no deben ser iguales";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ["start_time"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ["end_time"],
      });
    }

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La hora de fin no debe ser menor a la hora de inicio",
        path: ["end_time"],
      });
    }

    if (end - start < 120) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las reservas tienen una duración mínima de 2 horas",
        path: ["end_time"],
      });
    }

    if (
      data.dateFinally &&
      data.date &&
      data.dateFinally.getTime() === data.date.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puedes finalizar el mismo día en que haces la reserva",
        path: ["dateFinally"],
      });
    }

    if (
      data.dateFinally &&
      data.date &&
      data.dateFinally.getTime() < data.date.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de finalización no puede ser menor a la reserva",
        path: ["dateFinally"],
      });
    }
  });

export type ReservationFormRecurringValues = z.infer<
  typeof reservationFormSchemaRecurring
>;

export const AvailableHours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];
