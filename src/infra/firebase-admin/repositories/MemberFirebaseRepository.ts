import type { DocumentData } from "firebase-admin/firestore";
import type { Member } from "@/domain/entities/Member";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import {
  memberFromPersistence,
  memberToPersistence,
} from "../mappers/memberMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberFirebaseRepository
  extends BaseFirebaseRepository<Member>
  implements IMemberRepository
{
  constructor() {
    super("members");
  }

  protected toEntity(data: DocumentData, id: string): Member {
    return memberFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Member): DocumentData {
    return memberToPersistence(entity);
  }

  async findByEmail(email: string): Promise<Member | null> {
    if (!email) return null;
    const snapshot = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
