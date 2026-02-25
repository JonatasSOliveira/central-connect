import { z } from "zod";

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SignInInputDTO = z.infer<typeof SignInInputSchema>;