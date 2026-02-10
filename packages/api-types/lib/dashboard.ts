import { z } from "zod";

export const DashboardStatsSchema = z.object({
  pendientes: z.number(),
  aprobadas: z.number(),
  rechazadas: z.number(),
  canceladas: z.number(),
  total: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
