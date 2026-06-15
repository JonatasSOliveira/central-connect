import type { MemberSpiritualJourney } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

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
