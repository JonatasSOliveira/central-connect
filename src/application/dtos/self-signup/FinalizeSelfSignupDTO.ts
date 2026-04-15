import { z } from "zod";

export const FinalizeSelfSignupInputSchema = z.object({
  googleToken: z.string().min(1, "Token do Google é obrigatório"),
  fullName: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(8, "Telefone é obrigatório"),
});

export type FinalizeSelfSignupInputDTO = z.infer<
  typeof FinalizeSelfSignupInputSchema
>;

export const FinalizeSelfSignupOutputSchema = z.object({
  memberId: z.string(),
  userId: z.string(),
  churchId: z.string(),
  linked: z.literal(true),
});

export type FinalizeSelfSignupOutputDTO = z.infer<
  typeof FinalizeSelfSignupOutputSchema
>;
