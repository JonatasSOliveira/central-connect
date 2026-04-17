import { z } from "zod";

export const ChurchFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  selfSignupDefaultRoleId: z.string().optional().or(z.literal("")),
});

export type ChurchFormData = z.infer<typeof ChurchFormSchema>;

export const churchFormDefaultValues: ChurchFormData = {
  name: "",
  selfSignupDefaultRoleId: "",
};

export const ChurchListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  selfSignupDefaultRoleId: z.string().nullable().optional(),
});

export type ChurchListItemDTO = z.infer<typeof ChurchListItemSchema>;
