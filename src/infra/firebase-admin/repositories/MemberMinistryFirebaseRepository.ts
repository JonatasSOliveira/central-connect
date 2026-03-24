import type { DocumentData } from "firebase-admin/firestore";
import type { MemberMinistry } from "@/domain/entities/MemberMinistry";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import {
  memberMinistryFromPersistence,
  memberMinistryToPersistence,
} from "../mappers/memberMinistryMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberMinistryFirebaseRepository
  extends BaseFirebaseRepository<MemberMinistry>
  implements IMemberMinistryRepository
{
  constructor() {
    super("memberMinistries");
  }

  protected toEntity(data: DocumentData, id: string): MemberMinistry {
    return memberMinistryFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberMinistry): DocumentData {
    return memberMinistryToPersistence(entity);
  }

  async findByMemberId(memberId: string): Promise<MemberMinistry[]> {
    const snapshot = await this.collection
      .where("memberId", "==", memberId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByMinistryId(ministryId: string): Promise<MemberMinistry[]> {
    const snapshot = await this.collection
      .where("ministryId", "==", ministryId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByMemberAndMinistry(
    memberId: string,
    ministryId: string,
  ): Promise<MemberMinistry | null> {
    const snapshot = await this.collection
      .where("memberId", "==", memberId)
      .where("ministryId", "==", ministryId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
