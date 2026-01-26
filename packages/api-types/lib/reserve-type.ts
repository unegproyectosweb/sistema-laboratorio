import { z } from "zod";

export const ReserveTypeNames = {
  CLASE: "CLASE",
  EVENTO: "EVENTO",
  MANTENIMIENTO: "MANTENIMIENTO",
} as const;

export type ReserveTypeName =
  (typeof ReserveTypeNames)[keyof typeof ReserveTypeNames];

export const ReserveTypeSchema = z.object({
  id: z.number(),
  name: z.enum(ReserveTypeNames),
  minimalAnticipation: z.number().optional(),
  blockDuration: z.number().optional(),
  priority: z.number().optional(),
  needsApproval: z.boolean().optional(),
});

export type ReserveType = z.infer<typeof ReserveTypeSchema>;
