import type { MemberSpiritualJourney } from "@/domain/entities";
import type { BaseRepository } from "./BaseRepository";

export interface IMemberSpiritualJourneyRepository
  extends BaseRepository<MemberSpiritualJourney> {
  upsertByMemberAndChurch(
    journey: MemberSpiritualJourney,
  ): Promise<MemberSpiritualJourney>;
}
