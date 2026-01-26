import { z } from "zod";

export const StatsSchema = z.object({
  pendientes: z.number(),
  aprobadas: z.number(),
  rechazadas: z.number(),
  canceladas: z.number(),
  total: z.number(),
});

export type Stats = z.infer<typeof StatsSchema>;
