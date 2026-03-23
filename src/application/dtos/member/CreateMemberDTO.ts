import { z } from "zod";

export const CreateMemberInputSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  churches: z
    .array(
      z.object({
        churchId: z.string().min(1, "Igreja é obrigatória"),
        roleId: z.string().min(1, "Cargo é obrigatório"),
      }),
    )
    .min(1, "Pelo menos uma igreja é obrigatória"),
});

export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;

export const UpdateMemberInputSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  fullName: z.string().min(1, "Nome é obrigatório").optional(),
  phone: z.string().optional(),
  churches: z
    .array(
      z.object({
        churchId: z.string().min(1, "Igreja é obrigatória"),
        roleId: z.string().min(1, "Cargo é obrigatório"),
      }),
    )
    .optional(),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberInputSchema>;

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

export type MemberChurchInfo = {
  churchId: string;
  churchName: string;
  roleId: string;
  roleName: string;
};
