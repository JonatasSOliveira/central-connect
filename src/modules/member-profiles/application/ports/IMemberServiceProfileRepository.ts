import type { MemberServiceProfile } from "@/modules/member-profiles/domain/entities/MemberServiceProfile";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

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
