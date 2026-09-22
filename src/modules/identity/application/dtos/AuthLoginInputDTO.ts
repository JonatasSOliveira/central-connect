import { z } from "zod";

export const AuthLoginInputSchema = z.object({
  googleToken: z.string().min(1),
});

export type AuthLoginInputDTO = z.infer<typeof AuthLoginInputSchema>;
