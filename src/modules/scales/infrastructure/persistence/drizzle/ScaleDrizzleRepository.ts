import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { scales } from "@/infra/database/drizzle/schema";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import { Scale } from "@/modules/scales/domain/entities/Scale";

function toEntity(row: typeof scales.$inferSelect): Scale {
  return new Scale({
    id: row.id,
    churchId: row.churchId,
    serviceId: row.serviceId,
    ministryId: row.ministryId,
    status: row.status as "draft" | "published",
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ScaleDrizzleRepository implements IScaleRepository {
  constructor(private readonly database: DatabaseExecutor) {}

  async findAll(): Promise<Scale[]> {
    const rows = await this.database
      .select()
      .from(scales)
      .where(isNull(scales.deletedAt));
    return rows.map(toEntity);
  }

  async findByChurchId(churchId: string): Promise<Scale[]> {
    const rows = await this.database
      .select()
      .from(scales)
      .where(and(eq(scales.churchId, churchId), isNull(scales.deletedAt)));
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Scale | null> {
    const [row] = await this.database
      .select()
      .from(scales)
      .where(and(eq(scales.id, id), isNull(scales.deletedAt)))
      .limit(1);
    return row ? toEntity(row) : null;
  }

  async findByServiceAndMinistry(
    churchId: string,
    serviceId: string,
    ministryId: string,
    excludeId?: string,
  ): Promise<Scale | null> {
    const rows = await this.database
      .select()
      .from(scales)
      .where(
        and(
          eq(scales.churchId, churchId),
          eq(scales.serviceId, serviceId),
          eq(scales.ministryId, ministryId),
          isNull(scales.deletedAt),
        ),
      );
    const row = rows.find((item) => item.id !== excludeId);
    return row ? toEntity(row) : null;
  }

  async findByFilters(
    churchId: string,
    filters: { serviceId?: string; ministryId?: string },
  ): Promise<Scale[]> {
    const conditions = [
      eq(scales.churchId, churchId),
      isNull(scales.deletedAt),
    ];
    if (filters.serviceId)
      conditions.push(eq(scales.serviceId, filters.serviceId));
    if (filters.ministryId)
      conditions.push(eq(scales.ministryId, filters.ministryId));
    const rows = await this.database
      .select()
      .from(scales)
      .where(and(...conditions));
    return rows.map(toEntity);
  }

  async create(entity: Scale): Promise<Scale> {
    const [row] = await this.database
      .insert(scales)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        serviceId: entity.serviceId,
        ministryId: entity.ministryId,
        status: entity.status,
        notes: entity.notes,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }

  async update(entity: Scale): Promise<Scale> {
    const [row] = await this.database
      .update(scales)
      .set({
        serviceId: entity.serviceId,
        ministryId: entity.ministryId,
        status: entity.status,
        notes: entity.notes,
        updatedAt: entity.updatedAt,
      })
      .where(and(eq(scales.id, entity.id), isNull(scales.deletedAt)))
      .returning();
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database
      .update(scales)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(scales.id, id), isNull(scales.deletedAt)));
  }
}
