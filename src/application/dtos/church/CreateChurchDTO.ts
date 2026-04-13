import { z } from "zod";

export const CreateChurchInputSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  selfSignupDefaultRoleId: z.string().optional().or(z.literal("")),
});

export type CreateChurchInputDTO = z.infer<typeof CreateChurchInputSchema>;
