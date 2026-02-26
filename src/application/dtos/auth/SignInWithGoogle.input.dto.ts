import { z } from "zod";

export const SignInWithGoogleInputSchema = z.object({
  token: z.string().min(1),
});

export type SignInWithGoogleInputDTO = z.infer<typeof SignInWithGoogleInputSchema>;
