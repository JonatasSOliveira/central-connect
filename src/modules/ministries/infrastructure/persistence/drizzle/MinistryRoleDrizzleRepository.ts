import { and, asc, eq, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { ministryRoles } from "@/infra/database/drizzle/schema";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import { MinistryRole } from "@/modules/ministries/domain/entities/MinistryRole";

function toEntity(row: typeof ministryRoles.$inferSelect): MinistryRole {
  return new MinistryRole({
    id: row.id,
    ministryId: row.ministryId,
    name: row.name,
    requiredCount: row.requiredCount,
    displayOrder: row.displayOrder,
    createdByUserId: row.createdByUserId,
    updatedByUserId: row.updatedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class MinistryRoleDrizzleRepository implements IMinistryRoleRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<MinistryRole | null> {
    const [row] = await this.database
      .select()
      .from(ministryRoles)
      .where(and(eq(ministryRoles.id, id), isNull(ministryRoles.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<MinistryRole[]> {
    const rows = await this.database
      .select()
      .from(ministryRoles)
      .where(isNull(ministryRoles.deletedAt))
      .orderBy(asc(ministryRoles.ministryId), asc(ministryRoles.displayOrder));

    return rows.map(toEntity);
  }

  async findByMinistryId(ministryId: string): Promise<MinistryRole[]> {
    const rows = await this.database
      .select()
      .from(ministryRoles)
      .where(
        and(
          eq(ministryRoles.ministryId, ministryId),
          isNull(ministryRoles.deletedAt),
        ),
      )
      .orderBy(asc(ministryRoles.displayOrder), asc(ministryRoles.name));

    return rows.map(toEntity);
  }

  async create(entity: MinistryRole): Promise<MinistryRole> {
    const [row] = await this.database
      .insert(ministryRoles)
      .values({
        id: entity.id,
        ministryId: entity.ministryId,
        name: entity.name,
        requiredCount: entity.requiredCount,
        displayOrder: entity.displayOrder,
        createdByUserId: entity.createdByUserId,
        updatedByUserId: entity.updatedByUserId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: MinistryRole): Promise<MinistryRole> {
    const [row] = await this.database
      .update(ministryRoles)
      .set({
        ministryId: entity.ministryId,
        name: entity.name,
        requiredCount: entity.requiredCount,
        displayOrder: entity.displayOrder,
        updatedByUserId: entity.updatedByUserId,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(eq(ministryRoles.id, entity.id), isNull(ministryRoles.deletedAt)),
      )
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(ministryRoles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(ministryRoles.id, id), isNull(ministryRoles.deletedAt)));
  }
}
