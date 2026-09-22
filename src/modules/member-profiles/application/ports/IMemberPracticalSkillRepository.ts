import type { MemberPracticalSkill } from "@/modules/member-profiles/domain/entities/MemberPracticalSkill";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberPracticalSkillRepository
  extends BaseRepository<MemberPracticalSkill> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberPracticalSkill[]>;
  findByChurchId(churchId: string): Promise<MemberPracticalSkill[]>;
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    skills: MemberPracticalSkill[],
  ): Promise<void>;
}
