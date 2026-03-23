import { z } from "zod";

export const GetMemberOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(["Active", "Inactive", "Paused"]),
  avatarUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetMemberOutput = z.infer<typeof GetMemberOutputSchema>;
