import { z } from "zod";

export const MinistryRoleFormSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(1, "Nome é obrigatório").max(100),
  requiredCount: z.coerce
    .number()
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade obrigatória deve ser no mínimo 1")
    .default(1),
});

export type MinistryRoleFormData = z.infer<typeof MinistryRoleFormSchema>;

export const MinistryFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  leaderId: z.string().nullable().optional(),
  notes: z.string().max(500).optional(),
  roles: z.array(MinistryRoleFormSchema).default([]),
});

export type MinistryFormData = z.infer<typeof MinistryFormSchema>;
export type MinistryFormInput = z.input<typeof MinistryFormSchema>;

export const MinistryRoleListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  requiredCount: z.number().int().min(1),
});

export type MinistryRoleListItemDTO = z.infer<
  typeof MinistryRoleListItemSchema
>;

export const MinistryListItemSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  name: z.string(),
  leaderId: z.string().nullable(),
  roles: z.array(MinistryRoleListItemSchema),
});

export type MinistryListItemDTO = z.infer<typeof MinistryListItemSchema>;

export const MinistryDetailSchema = MinistryListItemSchema.extend({
  notes: z.string().nullable(),
  createdAt: z.date(),
});

export type MinistryDetailDTO = z.infer<typeof MinistryDetailSchema>;
