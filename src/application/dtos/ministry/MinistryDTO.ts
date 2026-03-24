import { z } from "zod";

export const MinistryRoleFormSchema = z.object({
<<<<<<< Updated upstream
=======
  id: z.string().nullable().optional(),
>>>>>>> Stashed changes
  name: z.string().min(1, "Nome é obrigatório").max(100),
});

export type MinistryRoleFormData = z.infer<typeof MinistryRoleFormSchema>;

export const MinistryFormSchema = z.object({
<<<<<<< Updated upstream
=======
  churchId: z.string().min(1, "Igreja é obrigatória"),
>>>>>>> Stashed changes
  name: z.string().min(1, "Nome é obrigatório").max(100),
  minMembersPerService: z.coerce.number().int().min(0).default(1),
  idealMembersPerService: z.coerce.number().int().min(0).default(2),
  notes: z.string().max(500).optional(),
  roles: z.array(MinistryRoleFormSchema).default([]),
});

export type MinistryFormData = z.infer<typeof MinistryFormSchema>;
<<<<<<< Updated upstream
=======
export type MinistryFormInput = z.input<typeof MinistryFormSchema>;
>>>>>>> Stashed changes

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
  minMembersPerService: z.number(),
  idealMembersPerService: z.number(),
  notes: z.string().nullable(),
  createdAt: z.date(),
});

export type MinistryDetailDTO = z.infer<typeof MinistryDetailSchema>;
