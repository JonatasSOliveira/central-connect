import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { rolePermissions } from "@/infra/database/drizzle/schema";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import { RolePermission } from "@/modules/roles/domain/entities/RolePermission";

function toEntity(row: typeof rolePermissions.$inferSelect): RolePermission {
  return new RolePermission({
    userRoleId: row.userRoleId,
    permission: row.permission,
  });
}

export class RolePermissionDrizzleRepository
  implements IRolePermissionRepository
{
  constructor(private readonly database: DatabaseExecutor) {}

  async create(entity: RolePermission): Promise<RolePermission> {
    await this.database
      .insert(rolePermissions)
      .values({
        userRoleId: entity.userRoleId,
        permission: entity.permission,
      })
      .onConflictDoNothing();

    return entity;
  }

  async createMany(entities: RolePermission[]): Promise<void> {
    if (entities.length === 0) return;

    await this.database
      .insert(rolePermissions)
      .values(
        entities.map((entity) => ({
          userRoleId: entity.userRoleId,
          permission: entity.permission,
        })),
      )
      .onConflictDoNothing();
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const rows = await this.database
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.userRoleId, roleId),
          isNull(rolePermissions.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async findByPermission(permission: string): Promise<RolePermission[]> {
    const rows = await this.database
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.permission, permission),
          isNull(rolePermissions.deletedAt),
        ),
      );

    return rows.map(toEntity);
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.database
      .update(rolePermissions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(rolePermissions.userRoleId, roleId),
          isNull(rolePermissions.deletedAt),
        ),
      );
  }

  async deleteByRoleIdAndPermission(
    roleId: string,
    permission: string,
  ): Promise<void> {
    await this.database
      .update(rolePermissions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(rolePermissions.userRoleId, roleId),
          eq(rolePermissions.permission, permission),
          isNull(rolePermissions.deletedAt),
        ),
      );
  }
}
