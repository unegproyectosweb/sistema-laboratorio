import { z } from "zod";
import { UserSchema } from "./auth";

export const ReservationTypeNames = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
  CANCELADO: "CANCELADO",
} as const;

export const ReservationSchema = z.object({
  id: z.number(),
  name: z.string().nullish(),
  startDate: z.string(),
  endDate: z.string().nullish(),
  defaultStartTime: z.string().optional(),
  defaultEndTime: z.string().optional(),
  state: z.object({ id: z.number(), name: z.string() }).nullish(),
  type: z.object({ id: z.number(), name: z.string() }).nullish(),
  user: UserSchema.nullish(),
  laboratory: z
    .object({ id: z.number(), name: z.string().optional() })
    .optional(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
