import { z } from "zod";

const confirmationSchema = z.enum([
  "incomplete",
  "availability",
  "consecutive_limit",
  "same_time_conflict",
]);

export const PublishGeneratedScalesSchema = z.object({
  serviceId: z.string().uuid(),
  scaleIds: z.array(z.string().uuid()).min(1).max(100),
  confirmations: z.array(confirmationSchema).max(10).default([]),
});

export const UnpublishGeneratedScalesSchema = z.object({
  serviceId: z.string().uuid(),
  scaleIds: z.array(z.string().uuid()).min(1).max(100),
});
