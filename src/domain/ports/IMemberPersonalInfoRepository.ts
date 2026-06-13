import type { MemberPersonalInfo } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberPersonalInfoRepository
  extends BaseRepository<MemberPersonalInfo> {
  upsertByMemberAndChurch(
    personalInfo: MemberPersonalInfo,
  ): Promise<MemberPersonalInfo>;
}
