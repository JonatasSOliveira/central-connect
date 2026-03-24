import type { Permission } from "@/domain/enums/Permission";

export type RoleListItem = {
  id: string;
  name: string;
};

export type ListRolesOutput = {
  roles: RoleListItem[];
};

export type GetRoleOutput = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  isSystem: boolean;
};
