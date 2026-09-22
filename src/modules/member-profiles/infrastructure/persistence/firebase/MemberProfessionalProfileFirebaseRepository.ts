import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IMemberProfessionalProfileRepository } from "@/modules/member-profiles/application/ports/IMemberProfessionalProfileRepository";
import type { MemberProfessionalProfile } from "@/modules/member-profiles/domain/entities/MemberProfessionalProfile";
import {
  memberProfessionalProfileFromPersistence,
  memberProfessionalProfileToPersistence,
} from "@/modules/member-profiles/infrastructure/mappers/memberProfessionalProfileMapper";

export class MemberProfessionalProfileFirebaseRepository
  extends BaseFirebaseRepository<MemberProfessionalProfile>
  implements IMemberProfessionalProfileRepository
{
  constructor() {
    super("memberProfessionalProfiles");
  }

  protected toEntity(
    data: DocumentData,
    id: string,
  ): MemberProfessionalProfile {
    return memberProfessionalProfileFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberProfessionalProfile): DocumentData {
    return memberProfessionalProfileToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberProfessionalProfile | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberProfessionalProfile[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async upsertByMemberAndChurch(
    profile: MemberProfessionalProfile,
  ): Promise<MemberProfessionalProfile> {
    const docId = `${profile.memberId}_${profile.churchId}`;
    await this.collection
      .doc(docId)
      .set(this.toFirestoreData(profile), { merge: true });
    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
