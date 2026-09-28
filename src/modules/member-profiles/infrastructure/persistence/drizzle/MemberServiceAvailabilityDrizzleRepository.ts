import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberServiceAvailabilities } from "@/infra/database/drizzle/schema";
import type { IMemberServiceAvailabilityRepository } from "@/modules/member-profiles/application/ports/IMemberServiceAvailabilityRepository";
import { MemberServiceAvailability } from "@/modules/member-profiles/domain/entities/MemberServiceAvailability";

const toEntity = (row: typeof memberServiceAvailabilities.$inferSelect) =>
  new MemberServiceAvailability({
    ...row,
    slot: row.slot as NonNullable<MemberServiceAvailability["slot"]>,
  });

export class MemberServiceAvailabilityDrizzleRepository
  implements IMemberServiceAvailabilityRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberServiceAvailabilities)
      .where(
        and(
          eq(memberServiceAvailabilities.id, id),
          isNull(memberServiceAvailabilities.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberServiceAvailabilities)
      .where(isNull(memberServiceAvailabilities.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const rows = await this.database
      .select()
      .from(memberServiceAvailabilities)
      .where(
        and(
          eq(memberServiceAvailabilities.memberId, memberId),
          eq(memberServiceAvailabilities.churchId, churchId),
          isNull(memberServiceAvailabilities.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberServiceAvailabilities)
      .where(
        and(
          eq(memberServiceAvailabilities.churchId, churchId),
          isNull(memberServiceAvailabilities.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberServiceAvailability) {
    const [row] = await this.database
      .insert(memberServiceAvailabilities)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberServiceAvailability) {
    const [row] = await this.database
      .update(memberServiceAvailabilities)
      .set({ slot: entity.slot, updatedAt: entity.updatedAt })
      .where(
        and(
          eq(memberServiceAvailabilities.id, entity.id),
          isNull(memberServiceAvailabilities.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberServiceAvailabilities)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberServiceAvailabilities.id, id),
          isNull(memberServiceAvailabilities.deletedAt),
        ),
      );
  }
  async replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    availabilities: MemberServiceAvailability[],
  ) {
    await this.database.transaction(async (transaction) => {
      const now = new Date();
      await transaction
        .update(memberServiceAvailabilities)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(memberServiceAvailabilities.memberId, memberId),
            eq(memberServiceAvailabilities.churchId, churchId),
            isNull(memberServiceAvailabilities.deletedAt),
          ),
        );
      const unique = new Map(
        availabilities.map((availability) => [availability.slot, availability]),
      );
      if (unique.size === 0) return;
      await transaction.insert(memberServiceAvailabilities).values(
        Array.from(unique.values()).map((availability) => ({
          id: availability.id,
          memberId: availability.memberId,
          churchId: availability.churchId,
          slot: availability.slot,
          createdAt: availability.createdAt,
          updatedAt: availability.updatedAt,
          deletedAt: availability.deletedAt,
        })),
      );
    });
  }
}
