import type { DocumentData } from "firebase-admin/firestore";
import type { MemberChurch } from "@/domain/entities/MemberChurch";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import {
  memberChurchFromPersistence,
  memberChurchToPersistence,
} from "../mappers/memberChurchMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberChurchFirebaseRepository
  extends BaseFirebaseRepository<MemberChurch>
  implements IMemberChurchRepository
{
  constructor() {
    super("memberChurches");
  }

  protected toEntity(data: DocumentData, id: string): MemberChurch {
    return memberChurchFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberChurch): DocumentData {
    return memberChurchToPersistence(entity);
  }

  async findByMemberId(memberId: string): Promise<MemberChurch[]> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByMemberIdAndChurchId(
    memberId: string,
    churchId: string,
  ): Promise<MemberChurch | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberChurch[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
