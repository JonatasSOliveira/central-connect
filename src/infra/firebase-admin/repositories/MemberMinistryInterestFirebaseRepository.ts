import type { DocumentData } from "firebase-admin/firestore";
import type { MemberMinistryInterest } from "@/domain/entities/MemberMinistryInterest";
import type { IMemberMinistryInterestRepository } from "@/domain/ports/IMemberMinistryInterestRepository";
import {
  memberMinistryInterestFromPersistence,
  memberMinistryInterestToPersistence,
} from "../mappers/memberMinistryInterestMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberMinistryInterestFirebaseRepository
  extends BaseFirebaseRepository<MemberMinistryInterest>
  implements IMemberMinistryInterestRepository
{
  constructor() {
    super("memberMinistryInterests");
  }

  protected toEntity(data: DocumentData, id: string): MemberMinistryInterest {
    return memberMinistryInterestFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberMinistryInterest): DocumentData {
    return memberMinistryInterestToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberMinistryInterest[]> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByChurchId(churchId: string): Promise<MemberMinistryInterest[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async replaceByMemberAndChurch(
    memberId: string,
    churchId: string,
    interests: MemberMinistryInterest[],
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

    for (const interest of interests) {
      batch.set(this.collection.doc(), this.toFirestoreData(interest));
    }

    await batch.commit();
  }
}
