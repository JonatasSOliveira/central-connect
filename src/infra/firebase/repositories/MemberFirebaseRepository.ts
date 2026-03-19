import type { DocumentData } from "firebase-admin/firestore";
import { Member, type MemberParams } from "@/domain/entities/Member";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberFirebaseRepository
  extends BaseFirebaseRepository<Member>
  implements IMemberRepository
{
  constructor() {
    super("members");
  }

  protected toEntity(data: DocumentData, id: string): Member {
    const convertedData = convertTimestampsToDates(data);
    const params: MemberParams = {
      id,
      email: convertedData.email ?? "",
      fullName: convertedData.fullName ?? "",
      phone: convertedData.phone ?? null,
      maxServicesPerMonth: convertedData.maxServicesPerMonth ?? 4,
      status: convertedData.status ?? "Active",
      avatarUrl: convertedData.avatarUrl ?? null,
      birthDate: convertedData.birthDate ?? null,
      notes: convertedData.notes ?? null,
    };
    return new Member(params);
  }

  protected toFirestoreData(entity: Member): DocumentData {
    return convertDatesToTimestamps({ ...entity });
  }

  async findByEmail(email: string): Promise<Member | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
