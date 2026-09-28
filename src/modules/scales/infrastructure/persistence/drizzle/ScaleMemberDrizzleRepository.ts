import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { scaleMembers } from "@/infra/database/drizzle/schema";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import { ScaleMember } from "@/modules/scales/domain/entities/ScaleMember";

function toEntity(row: typeof scaleMembers.$inferSelect): ScaleMember {
  return new ScaleMember({
    id: row.id,
    scaleId: row.scaleId,
    memberId: row.memberId,
    ministryRoleId: row.ministryRoleId,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  });
}

export class ScaleMemberDrizzleRepository implements IScaleMemberRepository {
  constructor(private readonly database: DatabaseExecutor) {}
  async findAll() {
    const rows = await this.database
      .select()
      .from(scaleMembers)
      .where(isNull(scaleMembers.deletedAt));
    return rows.map(toEntity);
  }
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(scaleMembers)
      .where(and(eq(scaleMembers.id, id), isNull(scaleMembers.deletedAt)))
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByMemberId(memberId: string) {
    const rows = await this.database
      .select()
      .from(scaleMembers)
      .where(
        and(
          eq(scaleMembers.memberId, memberId),
          isNull(scaleMembers.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByScaleId(scaleId: string) {
    const rows = await this.database
      .select()
      .from(scaleMembers)
      .where(
        and(eq(scaleMembers.scaleId, scaleId), isNull(scaleMembers.deletedAt)),
      );
    return rows.map(toEntity);
  }
  async findByScaleIds(scaleIds: string[]) {
    if (scaleIds.length === 0) return [];
    const rows = await this.database
      .select()
      .from(scaleMembers)
      .where(
        and(
          inArray(scaleMembers.scaleId, Array.from(new Set(scaleIds))),
          isNull(scaleMembers.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: ScaleMember) {
    const [row] = await this.database
      .insert(scaleMembers)
      .values({
        id: entity.id,
        scaleId: entity.scaleId,
        memberId: entity.memberId,
        ministryRoleId: entity.ministryRoleId,
        notes: entity.notes,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      })
      .returning();
    return toEntity(row);
  }
  async update(entity: ScaleMember) {
    const [row] = await this.database
      .update(scaleMembers)
      .set({
        memberId: entity.memberId,
        ministryRoleId: entity.ministryRoleId,
        notes: entity.notes,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(eq(scaleMembers.id, entity.id), isNull(scaleMembers.deletedAt)),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(scaleMembers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(scaleMembers.id, id), isNull(scaleMembers.deletedAt)));
  }
  async deleteByScaleId(scaleId: string) {
    await this.database
      .update(scaleMembers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(eq(scaleMembers.scaleId, scaleId), isNull(scaleMembers.deletedAt)),
      );
  }
}
