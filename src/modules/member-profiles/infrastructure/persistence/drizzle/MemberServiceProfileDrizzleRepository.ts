import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberServiceProfiles } from "@/infra/database/drizzle/schema";
import type { IMemberServiceProfileRepository } from "@/modules/member-profiles/application/ports/IMemberServiceProfileRepository";
import { MemberServiceProfile } from "@/modules/member-profiles/domain/entities/MemberServiceProfile";

const toEntity = (row: typeof memberServiceProfiles.$inferSelect) =>
  new MemberServiceProfile({
    ...row,
    currentlyServes: row.currentlyServes ?? false,
  });

export class MemberServiceProfileDrizzleRepository
  implements IMemberServiceProfileRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberServiceProfiles)
      .where(
        and(
          eq(memberServiceProfiles.id, id),
          isNull(memberServiceProfiles.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberServiceProfiles)
      .where(isNull(memberServiceProfiles.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const [row] = await this.database
      .select()
      .from(memberServiceProfiles)
      .where(
        and(
          eq(memberServiceProfiles.memberId, memberId),
          eq(memberServiceProfiles.churchId, churchId),
          isNull(memberServiceProfiles.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberServiceProfiles)
      .where(
        and(
          eq(memberServiceProfiles.churchId, churchId),
          isNull(memberServiceProfiles.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberServiceProfile) {
    const [row] = await this.database
      .insert(memberServiceProfiles)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberServiceProfile) {
    const [row] = await this.database
      .update(memberServiceProfiles)
      .set({
        currentlyServes: entity.currentlyServes,
        instrumentalPraiseInstrument: entity.instrumentalPraiseInstrument,
        otherDesiredMinistry: entity.otherDesiredMinistry,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberServiceProfiles.id, entity.id),
          isNull(memberServiceProfiles.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberServiceProfiles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberServiceProfiles.id, id),
          isNull(memberServiceProfiles.deletedAt),
        ),
      );
  }
  async upsertByMemberAndChurch(entity: MemberServiceProfile) {
    const [row] = await this.database
      .insert(memberServiceProfiles)
      .values(entity)
      .onConflictDoUpdate({
        target: [
          memberServiceProfiles.memberId,
          memberServiceProfiles.churchId,
        ],
        set: {
          currentlyServes: entity.currentlyServes,
          instrumentalPraiseInstrument: entity.instrumentalPraiseInstrument,
          otherDesiredMinistry: entity.otherDesiredMinistry,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();
    return toEntity(row);
  }
}
