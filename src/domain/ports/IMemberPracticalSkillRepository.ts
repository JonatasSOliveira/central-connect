import type { MemberPracticalSkill } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberPracticalSkillRepository
  extends BaseRepository<MemberPracticalSkill> {
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    skills: MemberPracticalSkill[],
  ): Promise<void>;
}
