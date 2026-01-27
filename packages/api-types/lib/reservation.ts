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
  rrule: z.string().nullish(),
  createdAt: z.string().nullish(),
  approvedAt: z.string().nullish(),
  state: z.object({ id: z.number(), name: z.string() }).nullish(),
  type: z.object({ id: z.number(), name: z.string() }).nullish(),
  user: UserSchema.nullish(),
  laboratory: z
    .object({ id: z.number(), name: z.string().optional() })
    .optional(),
  classInstance: z.object({ id: z.number(), professor: z.string() }).nullish(),
  event: z.object({ id: z.number(), stimatedAssistants: z.number() }).nullish(),
  ocupations: z
    .array(
      z.object({
        id: z.number(),
        date: z.string(),
        startHour: z.string(),
        endHour: z.string(),
        active: z.boolean(),
      }),
    )
    .optional(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
