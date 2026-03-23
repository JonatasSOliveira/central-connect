import { z } from "zod";

export const MemberListItemSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(["Active", "Inactive", "Paused"]),
  avatarUrl: z.string().nullable(),
});

export type MemberListItem = z.infer<typeof MemberListItemSchema>;

export const ListMembersOutputSchema = z.object({
  members: z.array(MemberListItemSchema),
});

export type ListMembersOutput = z.infer<typeof ListMembersOutputSchema>;
