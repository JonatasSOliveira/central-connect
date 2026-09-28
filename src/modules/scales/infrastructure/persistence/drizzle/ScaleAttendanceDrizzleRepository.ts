import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import { scaleAttendances } from "@/infra/database/drizzle/schema";
import type { IScaleAttendanceRepository } from "@/modules/scales/application/ports/IScaleAttendanceRepository";
import { ScaleAttendance } from "@/modules/scales/domain/entities/ScaleAttendance";

function toEntity(row: typeof scaleAttendances.$inferSelect): ScaleAttendance {
  return new ScaleAttendance({
    id: row.id,
    churchId: row.churchId,
    scaleId: row.scaleId,
    status: row.status as "draft" | "published",
    publishedAt: row.publishedAt,
    publishedByUserId: row.publishedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ScaleAttendanceDrizzleRepository
  implements IScaleAttendanceRepository
{
  constructor(private readonly database: DatabaseClient) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(scaleAttendances)
      .where(
        and(eq(scaleAttendances.id, id), isNull(scaleAttendances.deletedAt)),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(scaleAttendances)
      .where(isNull(scaleAttendances.deletedAt));
    return rows.map(toEntity);
  }
  async findByScaleId(scaleId: string) {
    const [row] = await this.database
      .select()
      .from(scaleAttendances)
      .where(
        and(
          eq(scaleAttendances.scaleId, scaleId),
          isNull(scaleAttendances.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByScaleIds(scaleIds: string[]) {
    if (scaleIds.length === 0) return [];
    const rows = await this.database
      .select()
      .from(scaleAttendances)
      .where(
        and(
          inArray(scaleAttendances.scaleId, Array.from(new Set(scaleIds))),
          isNull(scaleAttendances.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: ScaleAttendance) {
    const [row] = await this.database
      .insert(scaleAttendances)
      .values({
        id: entity.id,
        churchId: entity.churchId,
        scaleId: entity.scaleId,
        status: entity.status,
        publishedAt: entity.publishedAt,
        publishedByUserId: entity.publishedByUserId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }
  async update(entity: ScaleAttendance) {
    const [row] = await this.database
      .update(scaleAttendances)
      .set({
        status: entity.status,
        publishedAt: entity.publishedAt,
        publishedByUserId: entity.publishedByUserId,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(scaleAttendances.id, entity.id),
          isNull(scaleAttendances.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(scaleAttendances)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(scaleAttendances.id, id), isNull(scaleAttendances.deletedAt)),
      );
  }
}
