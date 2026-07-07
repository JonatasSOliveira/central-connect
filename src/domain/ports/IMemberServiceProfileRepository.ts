import type { MemberServiceProfile } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberServiceProfileRepository
  extends BaseRepository<MemberServiceProfile> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberServiceProfile | null>;
  findByChurchId(churchId: string): Promise<MemberServiceProfile[]>;
  upsertByMemberAndChurch(
    serviceProfile: MemberServiceProfile,
  ): Promise<MemberServiceProfile>;
}
