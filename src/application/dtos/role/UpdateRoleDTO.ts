import { z } from "zod";
import { Permission } from "@/domain/enums/Permission";

export const UpdateRoleInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  permissions: z
    .array(z.nativeEnum(Permission))
    .min(1, "Ao menos uma permissão é obrigatória"),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;

export const UpdateRoleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateRoleOutput = z.infer<typeof UpdateRoleOutputSchema>;
