import type { MemberServiceProfile } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberServiceProfileRepository
  extends BaseRepository<MemberServiceProfile> {
  upsertByMemberAndChurch(
    serviceProfile: MemberServiceProfile,
  ): Promise<MemberServiceProfile>;
}
