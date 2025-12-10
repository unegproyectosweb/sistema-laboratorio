import z from "zod";

function requiredValue(message = "Este campo es obligatorio") {
  return (ctx: z.core.$ZodRawIssue) => {
    return ctx.input ? "Valor inválido" : message;
  };
}

export const reservationFormSchema = z.object({
  date: z.date({ error: requiredValue("La fecha es requerida") }),
  time: z.string({ error: requiredValue() }).nonempty("La hora es requerida"),
  description: z.string().optional(),
});

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

export async function reservationFormAction(
  value: z.infer<typeof reservationFormSchema>,
) {
  if (!AvailableHours.includes(value.time)) {
    return {
      error: "La hora seleccionada no está disponible",
    };
  }

  // TODO: Replace with actual API call
  console.log("Reservación creada:", value);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
