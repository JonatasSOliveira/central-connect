import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberProfessionalProfiles } from "@/infra/database/drizzle/schema";
import type { IMemberProfessionalProfileRepository } from "@/modules/member-profiles/application/ports/IMemberProfessionalProfileRepository";
import { MemberProfessionalProfile } from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";

const toEntity = (row: typeof memberProfessionalProfiles.$inferSelect) =>
  new MemberProfessionalProfile({
    ...row,
    currentProfession: row.currentProfession ?? "",
    mutiraoAvailability: row.mutiraoAvailability as NonNullable<
      MemberProfessionalProfile["mutiraoAvailability"]
    >,
  });

export class MemberProfessionalProfileDrizzleRepository
  implements IMemberProfessionalProfileRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberProfessionalProfiles)
      .where(
        and(
          eq(memberProfessionalProfiles.id, id),
          isNull(memberProfessionalProfiles.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberProfessionalProfiles)
      .where(isNull(memberProfessionalProfiles.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const [row] = await this.database
      .select()
      .from(memberProfessionalProfiles)
      .where(
        and(
          eq(memberProfessionalProfiles.memberId, memberId),
          eq(memberProfessionalProfiles.churchId, churchId),
          isNull(memberProfessionalProfiles.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberProfessionalProfiles)
      .where(
        and(
          eq(memberProfessionalProfiles.churchId, churchId),
          isNull(memberProfessionalProfiles.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberProfessionalProfile) {
    const [row] = await this.database
      .insert(memberProfessionalProfiles)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberProfessionalProfile) {
    const [row] = await this.database
      .update(memberProfessionalProfiles)
      .set({
        currentProfession: entity.currentProfession,
        mutiraoAvailability: entity.mutiraoAvailability,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberProfessionalProfiles.id, entity.id),
          isNull(memberProfessionalProfiles.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberProfessionalProfiles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberProfessionalProfiles.id, id),
          isNull(memberProfessionalProfiles.deletedAt),
        ),
      );
  }
  async upsertByMemberAndChurch(entity: MemberProfessionalProfile) {
    const [row] = await this.database
      .insert(memberProfessionalProfiles)
      .values(entity)
      .onConflictDoUpdate({
        target: [
          memberProfessionalProfiles.memberId,
          memberProfessionalProfiles.churchId,
        ],
        set: {
          currentProfession: entity.currentProfession,
          mutiraoAvailability: entity.mutiraoAvailability,
          updatedAt: entity.updatedAt,
          deletedAt: null,
        },
      })
      .returning();
    return toEntity(row);
  }
}
