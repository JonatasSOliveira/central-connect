import { and, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { userRoles } from "@/infra/database/drizzle/schema";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { UserRole } from "@/modules/roles/domain/entities/UserRole";

function toEntity(row: typeof userRoles.$inferSelect): UserRole {
  return new UserRole({
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.isSystem,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class RoleDrizzleRepository implements IRoleRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<UserRole | null> {
    const [row] = await this.database
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.id, id), isNull(userRoles.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findByName(name: string): Promise<UserRole | null> {
    const [row] = await this.database
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.name, name), isNull(userRoles.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<UserRole[]> {
    const rows = await this.database
      .select()
      .from(userRoles)
      .where(isNull(userRoles.deletedAt));

    return rows.map(toEntity);
  }

  async create(entity: UserRole): Promise<UserRole> {
    const [row] = await this.database
      .insert(userRoles)
      .values({
        id: entity.id,
        name: entity.name,
        description: entity.description,
        isSystem: entity.isSystem,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: UserRole): Promise<UserRole> {
    const [row] = await this.database
      .update(userRoles)
      .set({
        name: entity.name,
        description: entity.description,
        isSystem: entity.isSystem,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(userRoles.id, entity.id), isNull(userRoles.deletedAt)))
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(userRoles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(userRoles.id, id), isNull(userRoles.deletedAt)));
  }
}
