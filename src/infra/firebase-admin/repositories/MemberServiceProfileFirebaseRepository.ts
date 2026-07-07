import type { DocumentData } from "firebase-admin/firestore";
import type { MemberServiceProfile } from "@/domain/entities/MemberServiceProfile";
import type { IMemberServiceProfileRepository } from "@/domain/ports/IMemberServiceProfileRepository";
import {
  memberServiceProfileFromPersistence,
  memberServiceProfileToPersistence,
} from "../mappers/memberServiceProfileMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberServiceProfileFirebaseRepository
  extends BaseFirebaseRepository<MemberServiceProfile>
  implements IMemberServiceProfileRepository
{
  constructor() {
    super("memberServiceProfiles");
  }

  protected toEntity(data: DocumentData, id: string): MemberServiceProfile {
    return memberServiceProfileFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberServiceProfile): DocumentData {
    return memberServiceProfileToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberServiceProfile | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberServiceProfile[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async upsertByMemberAndChurch(
    profile: MemberServiceProfile,
  ): Promise<MemberServiceProfile> {
    const docId = `${profile.memberId}_${profile.churchId}`;
    await this.collection
      .doc(docId)
      .set(this.toFirestoreData(profile), { merge: true });
    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
