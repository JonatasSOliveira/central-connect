import { z } from "zod";

export const FinalizeSelfSignupInputSchema = z
  .object({
    googleToken: z.string().min(1, "Token do Google é obrigatório"),
    fullName: z.string().min(1, "Nome é obrigatório"),
    phone: z.string().min(8, "Telefone é obrigatório"),
    acceptedTerms: z.literal(true, {
      message: "Aceite dos termos é obrigatório",
    }),
    ministryIds: z.array(z.string()).default([]),
    confirmNoMinistry: z.boolean().default(false),
  })
  .refine(
    (data) => data.ministryIds.length > 0 || data.confirmNoMinistry === true,
    {
      message:
        "Selecione ao menos um ministério ou confirme que não serve em nenhum",
      path: ["confirmNoMinistry"],
    },
  );

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
