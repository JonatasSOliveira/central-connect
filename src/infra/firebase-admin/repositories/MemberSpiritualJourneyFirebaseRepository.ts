import type { DocumentData } from "firebase-admin/firestore";
import type { MemberSpiritualJourney } from "@/domain/entities/MemberSpiritualJourney";
import type { IMemberSpiritualJourneyRepository } from "@/domain/ports/IMemberSpiritualJourneyRepository";
import {
  memberSpiritualJourneyFromPersistence,
  memberSpiritualJourneyToPersistence,
} from "../mappers/memberSpiritualJourneyMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberSpiritualJourneyFirebaseRepository
  extends BaseFirebaseRepository<MemberSpiritualJourney>
  implements IMemberSpiritualJourneyRepository
{
  constructor() {
    super("memberSpiritualJourneys");
  }

  protected toEntity(data: DocumentData, id: string): MemberSpiritualJourney {
    return memberSpiritualJourneyFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberSpiritualJourney): DocumentData {
    return memberSpiritualJourneyToPersistence(entity);
  }

  async upsertByMemberAndChurch(
    journey: MemberSpiritualJourney,
  ): Promise<MemberSpiritualJourney> {
    const docId = `${journey.memberId}_${journey.churchId}`;
    await this.collection
      .doc(docId)
      .set(this.toFirestoreData(journey), { merge: true });
    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
