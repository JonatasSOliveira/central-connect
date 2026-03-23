import { z } from "zod";
import { Permission } from "@/domain/enums/Permission";

export const RoleListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
  isSystem: z.boolean(),
});

export type RoleListItem = z.infer<typeof RoleListItemSchema>;

export const ListRolesOutputSchema = z.object({
  roles: z.array(RoleListItemSchema),
});

export type ListRolesOutput = z.infer<typeof ListRolesOutputSchema>;

export const GetRoleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.nativeEnum(Permission)),
  isSystem: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetRoleOutput = z.infer<typeof GetRoleOutputSchema>;
