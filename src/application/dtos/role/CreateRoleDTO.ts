import { z } from "zod";
import { Permission } from "@/domain/enums/Permission";

export const CreateRoleInputSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  permissions: z
    .array(z.nativeEnum(Permission))
    .min(1, "Ao menos uma permissão é obrigatória"),
});

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

export const CreateRoleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateRoleOutput = z.infer<typeof CreateRoleOutputSchema>;
