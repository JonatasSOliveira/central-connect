import { z } from "zod";

export const UpsertPushTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  deviceId: z.string().max(120).optional(),
  platform: z.enum(["web"]).default("web"),
});

export type UpsertPushTokenInput = z.infer<typeof UpsertPushTokenSchema>;

export const RemovePushTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

export type RemovePushTokenInput = z.infer<typeof RemovePushTokenSchema>;
