import { and, eq, isNull } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { memberPracticalSkills } from "@/infra/database/drizzle/schema";
import type { IMemberPracticalSkillRepository } from "@/modules/member-profiles/application/ports/IMemberPracticalSkillRepository";
import { MemberPracticalSkill } from "@/modules/member-profiles/domain/entities/MemberPracticalSkill";

const toEntity = (row: typeof memberPracticalSkills.$inferSelect) =>
  new MemberPracticalSkill({
    ...row,
    skill: row.skill as NonNullable<MemberPracticalSkill["skill"]>,
    languages: row.languages,
  });

export class MemberPracticalSkillDrizzleRepository
  implements IMemberPracticalSkillRepository
{
  constructor(private readonly database: DatabaseExecutor) {}
  async findById(id: string) {
    const [row] = await this.database
      .select()
      .from(memberPracticalSkills)
      .where(
        and(
          eq(memberPracticalSkills.id, id),
          isNull(memberPracticalSkills.deletedAt),
        ),
      )
      .limit(1);
    return row ? toEntity(row) : null;
  }
  async findAll() {
    const rows = await this.database
      .select()
      .from(memberPracticalSkills)
      .where(isNull(memberPracticalSkills.deletedAt));
    return rows.map(toEntity);
  }
  async findByMemberAndChurch(memberId: string, churchId: string) {
    const rows = await this.database
      .select()
      .from(memberPracticalSkills)
      .where(
        and(
          eq(memberPracticalSkills.memberId, memberId),
          eq(memberPracticalSkills.churchId, churchId),
          isNull(memberPracticalSkills.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async findByChurchId(churchId: string) {
    const rows = await this.database
      .select()
      .from(memberPracticalSkills)
      .where(
        and(
          eq(memberPracticalSkills.churchId, churchId),
          isNull(memberPracticalSkills.deletedAt),
        ),
      );
    return rows.map(toEntity);
  }
  async create(entity: MemberPracticalSkill) {
    const [row] = await this.database
      .insert(memberPracticalSkills)
      .values(entity)
      .returning();
    return toEntity(row);
  }
  async update(entity: MemberPracticalSkill) {
    const [row] = await this.database
      .update(memberPracticalSkills)
      .set({
        skill: entity.skill,
        hasDriverLicense: entity.hasDriverLicense,
        hasOwnVehicle: entity.hasOwnVehicle,
        languages: entity.languages,
        otherSkill: entity.otherSkill,
        updatedAt: entity.updatedAt,
      })
      .where(
        and(
          eq(memberPracticalSkills.id, entity.id),
          isNull(memberPracticalSkills.deletedAt),
        ),
      )
      .returning();
    return toEntity(row);
  }
  async delete(id: string) {
    await this.database
      .update(memberPracticalSkills)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(memberPracticalSkills.id, id),
          isNull(memberPracticalSkills.deletedAt),
        ),
      );
  }
  async replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    skills: MemberPracticalSkill[],
  ) {
    await this.database.transaction(async (transaction) => {
      const now = new Date();
      await transaction
        .update(memberPracticalSkills)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(memberPracticalSkills.memberId, memberId),
            eq(memberPracticalSkills.churchId, churchId),
            isNull(memberPracticalSkills.deletedAt),
          ),
        );
      if (skills.length === 0) return;
      await transaction.insert(memberPracticalSkills).values(
        skills.map((skill) => ({
          id: skill.id,
          memberId: skill.memberId,
          churchId: skill.churchId,
          skill: skill.skill,
          hasDriverLicense: skill.hasDriverLicense,
          hasOwnVehicle: skill.hasOwnVehicle,
          languages: skill.languages,
          otherSkill: skill.otherSkill,
          createdAt: skill.createdAt,
          updatedAt: skill.updatedAt,
          deletedAt: skill.deletedAt,
        })),
      );
    });
  }
}
