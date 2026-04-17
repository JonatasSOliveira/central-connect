import { z } from "zod";

export const LookupSelfSignupMemberInputSchema = z.object({
  phone: z.string().min(8, "Telefone é obrigatório"),
});

export type LookupSelfSignupMemberInputDTO = z.infer<
  typeof LookupSelfSignupMemberInputSchema
>;

export const LookupSelfSignupMemberOutputSchema = z.object({
  memberExists: z.boolean(),
  prefill: z
    .object({
      fullName: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
    })
    .nullable(),
});

export type LookupSelfSignupMemberOutputDTO = z.infer<
  typeof LookupSelfSignupMemberOutputSchema
>;
