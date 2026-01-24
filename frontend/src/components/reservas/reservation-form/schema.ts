/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAccessToken } from "@/lib/auth";
import z from "zod";

function requiredValue(message = "Este campo es obligatorio") {
  return (ctx: z.core.$ZodRawIssue) => {
    return ctx.input ? "Valor inválido" : message;
  };
}

export const reservationFormSchema = z.object({
  date: z.date({ error: requiredValue("La fecha es requerida") }),
  start_time: z.string({ error: requiredValue() }).nonempty("La hora para empezar requerida"),
  end_time: z.string({ error: requiredValue() }).nonempty("La hora de finalizacion es requerida"),
  description: z.string({ error: requiredValue() }).nonempty("El laboratorio es requerido"),
  type_event: z.coerce.number({}).positive("Selecciona un evento válido"),
  laboratorio: z.coerce.number({}).positive("Selecciona un laboratorio válido"),

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


export const AvailableLaboratorys = [
  "Villa asia",
  "Unexpo",
  "Atlantico",
];



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
