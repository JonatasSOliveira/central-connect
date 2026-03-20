import type { DocumentData } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import type { Invite } from "@/domain/entities/Invite";
import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import {
  inviteFromPersistence,
  inviteToPersistence,
} from "../mappers/inviteMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class InviteFirebaseRepository
  extends BaseFirebaseRepository<Invite>
  implements IInviteRepository
{
  constructor() {
    super("invites");
  }

  protected toEntity(data: DocumentData, id: string): Invite {
    return inviteFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Invite): DocumentData {
    return inviteToPersistence(entity);
  }

  async findByEmail(email: string): Promise<Invite | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .where("isUsed", "==", false)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByEmailAndChurchId(
    email: string,
    churchId: string,
  ): Promise<Invite | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .where("churchId", "==", churchId)
      .where("isUsed", "==", false)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async markAsUsed(inviteId: string): Promise<void> {
    await this.collection.doc(inviteId).update({
      isUsed: true,
      usedAt: Timestamp.now(),
    });
  }
}
