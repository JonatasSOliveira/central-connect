import { z } from "zod";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";

export const ChurchFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  selfSignupDefaultRoleId: z.string().optional().or(z.literal("")),
  maxConsecutiveScalesPerMember: z
    .number()
    .int()
    .min(1)
    .max(10),
});

export type ChurchFormData = z.infer<typeof ChurchFormSchema>;

export const churchFormDefaultValues: ChurchFormData = {
  name: "",
  selfSignupDefaultRoleId: "",
  maxConsecutiveScalesPerMember: DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER,
};

export const ChurchListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  selfSignupDefaultRoleId: z.string().nullable().optional(),
  maxConsecutiveScalesPerMember: z.number().int().min(1).max(10).optional(),
});

export type ChurchListItemDTO = z.infer<typeof ChurchListItemSchema>;
