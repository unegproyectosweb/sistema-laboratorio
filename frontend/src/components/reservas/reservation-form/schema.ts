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

export const reservationFormSchema = z
  .object({
    date: z.date({ error: requiredValue("La fecha es requerida") }),
    dateFinally: z.date({ error: requiredValue("La fecha es requerida") }),
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

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

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

export const AvailableLaboratorys = ["Villa asia", "Unexpo", "Atlantico"];

export async function reservationFormAction(
  value: z.infer<typeof reservationFormSchema>,
) {
  if (!AvailableHours.includes(value.start_time)) {
    throw new Error("La hora seleccionada no está disponible");
  }

  if (!AvailableHours.includes(value.end_time)) {
    throw new Error("La hora seleccionada no está disponible");
  }

  console.log("Reservación creada:", value);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
