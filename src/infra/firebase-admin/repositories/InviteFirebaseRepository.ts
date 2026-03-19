import type { DocumentData } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { Invite, type InviteParams } from "@/domain/entities/Invite";
import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class InviteFirebaseRepository
  extends BaseFirebaseRepository<Invite>
  implements IInviteRepository
{
  constructor() {
    super("invites");
  }

  protected toEntity(data: DocumentData, id: string): Invite {
    const convertedData = convertTimestampsToDates(data);
    const params: InviteParams = {
      id,
      email: convertedData.email ?? "",
      roleId: convertedData.roleId ?? "",
      churchId: convertedData.churchId ?? "",
      isUsed: convertedData.isUsed ?? false,
      usedAt: convertedData.usedAt ?? null,
    };
    return new Invite(params);
  }

  protected toFirestoreData(entity: Invite): DocumentData {
    return convertDatesToTimestamps({ ...entity });
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
