import { z } from "zod";

export const GenerateScalePreviewSchema = z.object({
  serviceId: z.string().uuid(),
  ministryIds: z.array(z.string().uuid()).min(1).max(50),
  mode: z.enum(["preserve-existing", "replace-existing"]).default(
    "preserve-existing",
  ),
});

export type GenerateScalePreviewInput = z.infer<
  typeof GenerateScalePreviewSchema
>;
