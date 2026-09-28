import { and, eq, inArray, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { churches } from "@/infra/database/drizzle/schema";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import { Church } from "@/modules/churches/domain/entities/Church";

function toEntity(row: typeof churches.$inferSelect): Church {
  return new Church({
    id: row.id,
    name: row.name,
    selfSignupDefaultRoleId: row.selfSignupDefaultRoleId,
    maxConsecutiveScalesPerMember: row.maxConsecutiveScalesPerMember,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ChurchDrizzleRepository implements IChurchRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findById(id: string): Promise<Church | null> {
    const [row] = await this.database
      .select()
      .from(churches)
      .where(and(eq(churches.id, id), isNull(churches.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<Church[]> {
    const rows = await this.database
      .select()
      .from(churches)
      .where(isNull(churches.deletedAt));

    return rows.map(toEntity);
  }

  async findByIds(ids: string[]): Promise<Church[]> {
    if (ids.length === 0) return [];

    const rows = await this.database
      .select()
      .from(churches)
      .where(and(inArray(churches.id, ids), isNull(churches.deletedAt)));
    const byId = new Map(rows.map((row) => [row.id, toEntity(row)]));

    return ids
      .map((id) => byId.get(id))
      .filter((church): church is Church => church !== undefined);
  }

  async create(entity: Church): Promise<Church> {
    const [row] = await this.database
      .insert(churches)
      .values({
        id: entity.id,
        name: entity.name,
        selfSignupDefaultRoleId: entity.selfSignupDefaultRoleId,
        maxConsecutiveScalesPerMember: entity.maxConsecutiveScalesPerMember,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: Church): Promise<Church> {
    const [row] = await this.database
      .update(churches)
      .set({
        name: entity.name,
        selfSignupDefaultRoleId: entity.selfSignupDefaultRoleId,
        maxConsecutiveScalesPerMember: entity.maxConsecutiveScalesPerMember,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(churches.id, entity.id), isNull(churches.deletedAt)))
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(churches)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(churches.id, id), isNull(churches.deletedAt)));
  }
}
