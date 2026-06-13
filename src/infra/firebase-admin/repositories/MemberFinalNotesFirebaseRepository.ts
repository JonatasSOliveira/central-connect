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
