import type { MemberPersonalInfo } from "@/modules/member-profiles/domain/entities/MemberPersonalInfo";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberPersonalInfoRepository
  extends BaseRepository<MemberPersonalInfo> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberPersonalInfo | null>;
  findByChurchId(churchId: string): Promise<MemberPersonalInfo[]>;
  upsertByMemberAndChurch(
    personalInfo: MemberPersonalInfo,
  ): Promise<MemberPersonalInfo>;
}
