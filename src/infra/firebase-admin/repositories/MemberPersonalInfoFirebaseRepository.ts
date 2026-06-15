import type { DocumentData } from "firebase-admin/firestore";
import type { MemberPersonalInfo } from "@/domain/entities/MemberPersonalInfo";
import type { IMemberPersonalInfoRepository } from "@/domain/ports/IMemberPersonalInfoRepository";
import {
  memberPersonalInfoFromPersistence,
  memberPersonalInfoToPersistence,
} from "../mappers/memberPersonalInfoMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberPersonalInfoFirebaseRepository
  extends BaseFirebaseRepository<MemberPersonalInfo>
  implements IMemberPersonalInfoRepository
{
  constructor() {
    super("memberPersonalInfos");
  }

  protected toEntity(data: DocumentData, id: string): MemberPersonalInfo {
    return memberPersonalInfoFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberPersonalInfo): DocumentData {
    return memberPersonalInfoToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberPersonalInfo | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberPersonalInfo[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async upsertByMemberAndChurch(
    personalInfo: MemberPersonalInfo,
  ): Promise<MemberPersonalInfo> {
    const docId = `${personalInfo.memberId}_${personalInfo.churchId}`;
    await this.collection
      .doc(docId)
      .set(this.toFirestoreData(personalInfo), { merge: true });
    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
