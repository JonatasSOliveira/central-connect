import type { MemberSpiritualJourney } from "@/modules/member-profiles/domain/entities/MemberSpiritualJourney";
import type { BaseRepository } from "@/shared/domain/ports/BaseRepository";

export interface IMemberSpiritualJourneyRepository
  extends BaseRepository<MemberSpiritualJourney> {
  findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberSpiritualJourney | null>;
  findByChurchId(churchId: string): Promise<MemberSpiritualJourney[]>;
  upsertByMemberAndChurch(
    journey: MemberSpiritualJourney,
  ): Promise<MemberSpiritualJourney>;
}
