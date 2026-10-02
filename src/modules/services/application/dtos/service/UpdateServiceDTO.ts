import { z } from "zod";
import { serviceDateSchema } from "./service-date-schema";

export const UpdateServiceInputSchema = z.object({
  title: z.string().min(1).optional(),
  date: serviceDateSchema.optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateServiceInput = z.infer<typeof UpdateServiceInputSchema>;
