import type { MemberServiceAvailability } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberServiceAvailabilityRepository
  extends BaseRepository<MemberServiceAvailability> {
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    availabilities: MemberServiceAvailability[],
  ): Promise<void>;
}
