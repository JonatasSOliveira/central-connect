import type { MemberPracticalSkill } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
