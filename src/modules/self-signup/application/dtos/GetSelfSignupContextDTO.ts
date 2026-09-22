import { z } from "zod";

export const GetSelfSignupContextOutputSchema = z.object({
  churchId: z.string(),
  churchName: z.string(),
  canProceed: z.boolean(),
  selfSignupEnabled: z.boolean(),
  hasDefaultRoleConfigured: z.boolean(),
  defaultRoleId: z.string().nullable(),
  message: z.string().nullable(),
  ministries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});

export type GetSelfSignupContextOutputDTO = z.infer<
  typeof GetSelfSignupContextOutputSchema
>;
