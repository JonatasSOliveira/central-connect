import { z } from "zod";

export const CreateServiceInputSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  date: z.string().transform((val) => new Date(val)),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)"),
  shift: z.enum(["Manhã", "Tarde", "Noite"]).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;

export const CreateServiceOutputSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  serviceTemplateId: z.string().nullable(),
  title: z.string(),
  date: z.date(),
  time: z.string(),
  shift: z.string().nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateServiceOutput = z.infer<typeof CreateServiceOutputSchema>;
