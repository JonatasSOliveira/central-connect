import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import { scaleAttendanceMembers } from "@/infra/database/drizzle/schema";
import type { IScaleAttendanceMemberRepository } from "@/modules/scales/application/ports/IScaleAttendanceMemberRepository";
import { ScaleAttendanceMember } from "@/modules/scales/domain/entities/ScaleAttendanceMember";

function toEntity(
  row: typeof scaleAttendanceMembers.$inferSelect,
): ScaleAttendanceMember {
  return new ScaleAttendanceMember({
    id: row.id,
    scaleAttendanceId: row.scaleAttendanceId,
    scaleId: row.scaleId,
    scaleMemberId: row.scaleMemberId,
    memberId: row.memberId,
    status: row.status as "present" | "absent_unexcused" | "absent_excused",
    justification: row.justification,
    checkedAt: row.checkedAt,
    checkedByUserId: row.checkedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ScaleAttendanceMemberDrizzleRepository
  implements IScaleAttendanceMemberRepository
{
  constructor(private readonly database: DatabaseClient) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(
        and(
          eq(scaleAttendanceMembers.id, id),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(isNull(scaleAttendanceMembers.deletedAt));
    return rows.map(toEntity);
  }
  async findByScaleAttendanceId(scaleAttendanceId: string) {
    const rows = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(
        and(
          eq(scaleAttendanceMembers.scaleAttendanceId, scaleAttendanceId),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByScaleMemberId(scaleMemberId: string) {
    const [row] = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(
        and(
          eq(scaleAttendanceMembers.scaleMemberId, scaleMemberId),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByScaleId(scaleId: string) {
    const rows = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(
        and(
          eq(scaleAttendanceMembers.scaleId, scaleId),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByScaleIds(scaleIds: string[]) {
    if (scaleIds.length === 0) return [];
    const rows = await this.database
      .select()
      .from(scaleAttendanceMembers)
      .where(
        and(
          inArray(
            scaleAttendanceMembers.scaleId,
            Array.from(new Set(scaleIds)),
          ),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: ScaleAttendanceMember) {
    const [row] = await this.database
      .insert(scaleAttendanceMembers)
      .values({
        id: entity.id,
        scaleAttendanceId: entity.scaleAttendanceId,
        scaleId: entity.scaleId,
        scaleMemberId: entity.scaleMemberId,
        memberId: entity.memberId,
        status: entity.status,
        justification: entity.justification,
        checkedAt: entity.checkedAt,
        checkedByUserId: entity.checkedByUserId,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }
  async update(entity: ScaleAttendanceMember) {
    const [row] = await this.database
      .update(scaleAttendanceMembers)
      .set({
        status: entity.status,
        justification: entity.justification,
        checkedAt: entity.checkedAt,
        checkedByUserId: entity.checkedByUserId,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(scaleAttendanceMembers.id, entity.id),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(scaleAttendanceMembers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(scaleAttendanceMembers.id, id),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      );
  }
  async deleteByScaleId(scaleId: string) {
    await this.database
      .update(scaleAttendanceMembers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(scaleAttendanceMembers.scaleId, scaleId),
          isNull(scaleAttendanceMembers.deletedAt),
        ),
      );
  }
}
