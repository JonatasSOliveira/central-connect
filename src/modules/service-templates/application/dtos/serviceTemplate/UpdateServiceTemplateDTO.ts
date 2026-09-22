import { z } from "zod";

export const UpdateServiceTemplateInputSchema = z.object({
  title: z.string().min(1).optional(),
  dayOfWeek: z
    .enum([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ])
    .optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateServiceTemplateInput = z.infer<
  typeof UpdateServiceTemplateInputSchema
>;
