import type { MemberServiceAvailability } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
