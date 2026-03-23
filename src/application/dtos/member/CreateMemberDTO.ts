import { z } from "zod";

export const CreateMemberInputSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  churchId: z.string().min(1, "Igreja é obrigatória"),
  roleId: z.string().min(1, "Cargo é obrigatório"),
});

export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

export const CreateMemberOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(["Active", "Inactive", "Paused"]),
  avatarUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateMemberOutput = z.infer<typeof CreateMemberOutputSchema>;
