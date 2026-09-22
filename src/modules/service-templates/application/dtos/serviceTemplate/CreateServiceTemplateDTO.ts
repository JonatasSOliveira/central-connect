import { z } from "zod";

export const CreateServiceTemplateInputSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  dayOfWeek: z.enum([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateServiceTemplateInput = z.infer<
  typeof CreateServiceTemplateInputSchema
>;

export const CreateServiceTemplateOutputSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  title: z.string(),
  dayOfWeek: z.string(),
  time: z.string(),
  location: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateServiceTemplateOutput = z.infer<
  typeof CreateServiceTemplateOutputSchema
>;
