import type { MemberServiceAvailability } from "@/modules/member-profiles/domain/entities/MemberServiceAvailability";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberServiceAvailabilityRepository
  extends BaseRepository<MemberServiceAvailability> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberServiceAvailability[]>;
  findByChurchId(churchId: string): Promise<MemberServiceAvailability[]>;
  replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    availabilities: MemberServiceAvailability[],
  ): Promise<void>;
}
