import { z } from "zod";

export const ScaleStatusSchema = z.enum(["draft", "published"]);

export const ScaleMemberFormSchema = z.object({
  id: z.string().nullable().optional(),
  memberId: z.string().min(1, "Membro é obrigatório"),
  ministryRoleId: z.string().min(1, "Função é obrigatória"),
  notes: z.string().optional(),
});

export type ScaleMemberFormData = z.infer<typeof ScaleMemberFormSchema>;

export const ScaleFormSchema = z.object({
  serviceId: z.string().min(1, "Culto é obrigatório"),
  ministryId: z.string().min(1, "Ministério é obrigatório"),
  status: ScaleStatusSchema.default("draft"),
  notes: z.string().max(500).optional(),
  members: z.array(ScaleMemberFormSchema).default([]),
});

export type ScaleFormData = z.infer<typeof ScaleFormSchema>;
export type ScaleFormInput = z.input<typeof ScaleFormSchema>;

export const ListScalesQuerySchema = z.object({
  serviceId: z.string().optional(),
  ministryId: z.string().optional(),
});

export const ScaleMemberListItemSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  ministryRoleId: z.string(),
  notes: z.string().nullable(),
});

export type ScaleMemberDTO = z.infer<typeof ScaleMemberListItemSchema>;

export const ScaleListItemSchema = z.object({
  id: z.string(),
  churchId: z.string(),
  serviceId: z.string(),
  ministryId: z.string(),
  status: ScaleStatusSchema,
  notes: z.string().nullable(),
});

export type ScaleListItemDTO = z.infer<typeof ScaleListItemSchema>;

export const ScaleDetailSchema = ScaleListItemSchema.extend({
  members: z.array(ScaleMemberListItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScaleDetailDTO = z.infer<typeof ScaleDetailSchema>;
