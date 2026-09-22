import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IMemberSpiritualJourneyRepository } from "@/modules/member-profiles/application/ports/IMemberSpiritualJourneyRepository";
import type { MemberSpiritualJourney } from "@/modules/member-profiles/domain/entities/MemberSpiritualJourney";
import {
  memberSpiritualJourneyFromPersistence,
  memberSpiritualJourneyToPersistence,
} from "@/modules/member-profiles/infrastructure/mappers/memberSpiritualJourneyMapper";

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

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberSpiritualJourney | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberSpiritualJourney[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
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
