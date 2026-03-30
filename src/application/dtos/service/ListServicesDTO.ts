import { z } from "zod";

export const ListServicesQuerySchema = z.object({
  churchId: z.string(),
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

export type ListServicesQuery = z.infer<typeof ListServicesQuerySchema>;
