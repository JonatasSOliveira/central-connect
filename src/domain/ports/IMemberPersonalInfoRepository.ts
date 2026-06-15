import type { MemberPersonalInfo } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
