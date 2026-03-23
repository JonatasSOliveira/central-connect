import type { RolePermission } from "@/domain/entities/RolePermission";

export interface IRolePermissionRepository {
  create(rolePermission: RolePermission): Promise<RolePermission>;
  createMany(rolePermissions: RolePermission[]): Promise<void>;
  findByRoleId(roleId: string): Promise<RolePermission[]>;
  findByPermission(permission: string): Promise<RolePermission[]>;
  deleteByRoleId(roleId: string): Promise<void>;
  deleteByRoleIdAndPermission(
    roleId: string,
    permission: string,
  ): Promise<void>;
}
