import type { DocumentData } from "firebase-admin/firestore";
import type { MemberServiceAvailability } from "@/domain/entities/MemberServiceAvailability";
import type { IMemberServiceAvailabilityRepository } from "@/domain/ports/IMemberServiceAvailabilityRepository";
import {
  memberServiceAvailabilityFromPersistence,
  memberServiceAvailabilityToPersistence,
} from "../mappers/memberServiceAvailabilityMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberServiceAvailabilityFirebaseRepository
  extends BaseFirebaseRepository<MemberServiceAvailability>
  implements IMemberServiceAvailabilityRepository
{
  constructor() {
    super("memberServiceAvailabilities");
  }

  protected toEntity(data: DocumentData, id: string): MemberServiceAvailability {
    return memberServiceAvailabilityFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberServiceAvailability): DocumentData {
    return memberServiceAvailabilityToPersistence(entity);
  }

  async replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    availabilities: MemberServiceAvailability[],
  ): Promise<void> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .get();
    const batch = this.collection.firestore.batch();
    const now = new Date();

    for (const doc of snapshot.docs) {
      batch.set(doc.ref, { deletedAt: now }, { merge: true });
    }

    for (const availability of availabilities) {
      batch.set(this.collection.doc(), this.toFirestoreData(availability));
    }

    await batch.commit();
  }
}
