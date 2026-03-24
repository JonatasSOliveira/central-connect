import { z } from "zod";

export const MinistryRoleFormSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(1, "Nome é obrigatório").max(100),
});

export type MinistryRoleFormData = z.infer<typeof MinistryRoleFormSchema>;

export const MinistryFormSchema = z.object({
  churchId: z.string().min(1, "Igreja é obrigatória"),
  name: z.string().min(1, "Nome é obrigatório").max(100),
  minMembersPerService: z.coerce.number().int().min(0).default(1),
  idealMembersPerService: z.coerce.number().int().min(0).default(2),
  notes: z.string().max(500).optional(),
  roles: z.array(MinistryRoleFormSchema).default([]),
});

export type MinistryFormData = z.infer<typeof MinistryFormSchema>;
export type MinistryFormInput = z.input<typeof MinistryFormSchema>;

export const MinistryRoleListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type MinistryRoleListItemDTO = z.infer<
  typeof MinistryRoleListItemSchema
>;

export const MinistryListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(MinistryRoleListItemSchema),
});

export type MinistryListItemDTO = z.infer<typeof MinistryListItemSchema>;

export const MinistryDetailSchema = MinistryListItemSchema.extend({
  churchId: z.string(),
  minMembersPerService: z.number(),
  idealMembersPerService: z.number(),
  notes: z.string().nullable(),
  createdAt: z.date(),
});

export type MinistryDetailDTO = z.infer<typeof MinistryDetailSchema>;
