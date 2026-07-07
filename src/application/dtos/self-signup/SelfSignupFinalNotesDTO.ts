import { z } from "zod";

export const SelfSignupFinalNotesSchema = z.object({
  healthLimitations: z.string().optional().or(z.literal("")),
  leadershipNotes: z.string().optional().or(z.literal("")),
});

export type SelfSignupFinalNotesDTO = z.infer<
  typeof SelfSignupFinalNotesSchema
>;
