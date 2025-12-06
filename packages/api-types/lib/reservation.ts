import { z } from "zod";

export const ReservationSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  fecha: z.string(),
  estado: z.string(),
  descripcion: z.string(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
