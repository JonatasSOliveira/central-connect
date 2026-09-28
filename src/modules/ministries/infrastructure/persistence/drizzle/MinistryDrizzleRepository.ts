import { and, eq, ilike, isNull } from "drizzle-orm";

import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { ministries } from "@/infra/database/drizzle/schema";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import { Ministry } from "@/modules/ministries/domain/entities/Ministry";

function toEntity(row: typeof ministries.$inferSelect): Ministry {
  return new Ministry({
    id: row.id,
    churchId: row.churchId,
    name: row.name,
    leaderId: row.leaderId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class MinistryDrizzleRepository implements IMinistryRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findAll(): Promise<Ministry[]> {
    const rows = await this.database
      .select()
      .from(ministries)
      .where(isNull(ministries.deletedAt));

    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Ministry | null> {
    const [row] = await this.database
      .select()
      .from(ministries)
      .where(and(eq(ministries.id, id), isNull(ministries.deletedAt)))
      .limit(1);

    return row ? toEntity(row) : null;
  }

  async findByChurchId(churchId: string): Promise<Ministry[]> {
    const rows = await this.database
      .select()
      .from(ministries)
      .where(
        and(eq(ministries.churchId, churchId), isNull(ministries.deletedAt)),
      );

    return rows.map(toEntity);
  }

  async findByChurchIdAndName(
    churchId: string,
    name: string,
    excludeId?: string,
  ): Promise<Ministry | null> {
    const conditions = [
      eq(ministries.churchId, churchId),
      ilike(ministries.name, name),
      isNull(ministries.deletedAt),
    ];

    const rows = await this.database
      .select()
      .from(ministries)
      .where(and(...conditions));
    const row = rows.find((item) => item.id !== excludeId);

    return row ? toEntity(row) : null;
  }

  async create(entity: Ministry): Promise<Ministry> {
    const [row] = await this.database
      .insert(ministries)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        name: entity.name,
        leaderId: entity.leaderId,
        notes: entity.notes,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();

    return toEntity(row);
  }

  async update(entity: Ministry): Promise<Ministry> {
    const [row] = await this.database
      .update(ministries)
      .set({
        churchId: entity.churchId,
        name: entity.name,
        leaderId: entity.leaderId,
        notes: entity.notes,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(ministries.id, entity.id), isNull(ministries.deletedAt)))
      .returning();

    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(ministries)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(ministries.id, id), isNull(ministries.deletedAt)));
  }
}
