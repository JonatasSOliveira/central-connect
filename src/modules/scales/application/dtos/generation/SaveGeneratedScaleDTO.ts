import { z } from "zod";

const assignmentSchema = z.object({
  memberId: z.string().uuid(),
  ministryRoleId: z.string().uuid(),
});

export const SaveGeneratedScaleSchema = z.object({
  serviceId: z.string().uuid(),
  ministries: z
    .array(
      z.object({
        ministryId: z.string().uuid(),
        assignments: z.array(assignmentSchema),
      }),
    )
    .min(1),
  status: z.enum(["draft", "published"]),
  mode: z.enum(["preserve-existing", "replace-existing"]),
  confirmations: z
    .array(
      z.enum([
        "incomplete",
        "availability",
        "consecutive_limit",
        "same_time_conflict",
        "replace_existing",
      ]),
    )
    .default([]),
});

export type SaveGeneratedScaleInput = z.infer<typeof SaveGeneratedScaleSchema>;
