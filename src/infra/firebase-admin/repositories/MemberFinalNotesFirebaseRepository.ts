import type { DocumentData } from "firebase-admin/firestore";
import type { MemberFinalNotes } from "@/domain/entities/MemberFinalNotes";
import type { IMemberFinalNotesRepository } from "@/domain/ports/IMemberFinalNotesRepository";
import {
  memberFinalNotesFromPersistence,
  memberFinalNotesToPersistence,
} from "../mappers/memberFinalNotesMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberFinalNotesFirebaseRepository
  extends BaseFirebaseRepository<MemberFinalNotes>
  implements IMemberFinalNotesRepository
{
  constructor() {
    super("memberFinalNotes");
  }

  protected toEntity(data: DocumentData, id: string): MemberFinalNotes {
    return memberFinalNotesFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberFinalNotes): DocumentData {
    return memberFinalNotesToPersistence(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberFinalNotes | null> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .where("churchId", "==", churchId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByChurchId(churchId: string): Promise<MemberFinalNotes[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async upsertByMemberAndChurch(
    finalNotes: MemberFinalNotes,
  ): Promise<MemberFinalNotes> {
    const docId = `${finalNotes.memberId}_${finalNotes.churchId}`;
    await this.collection
      .doc(docId)
      .set(this.toFirestoreData(finalNotes), { merge: true });
    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
