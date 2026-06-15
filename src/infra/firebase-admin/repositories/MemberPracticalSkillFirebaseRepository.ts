import type { DocumentData } from "firebase-admin/firestore";
import type { MemberPracticalSkill } from "@/domain/entities/MemberPracticalSkill";
import type { IMemberPracticalSkillRepository } from "@/domain/ports/IMemberPracticalSkillRepository";
import {
  memberPracticalSkillFromPersistence,
  memberPracticalSkillToPersistence,
} from "../mappers/memberPracticalSkillMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberPracticalSkillFirebaseRepository
  extends BaseFirebaseRepository<MemberPracticalSkill>
  implements IMemberPracticalSkillRepository
{
  constructor() {
    super("memberPracticalSkills");
  }

  protected toEntity(data: DocumentData, id: string): MemberPracticalSkill {
    return memberPracticalSkillFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberPracticalSkill): DocumentData {
    return memberPracticalSkillToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberPracticalSkill[]> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByChurchId(churchId: string): Promise<MemberPracticalSkill[]> {
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
    skills: MemberPracticalSkill[],
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

    for (const skill of skills) {
      batch.set(this.collection.doc(), this.toFirestoreData(skill));
    }

    await batch.commit();
  }
}
