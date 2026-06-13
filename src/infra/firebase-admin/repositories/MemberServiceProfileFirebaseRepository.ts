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
