import type { DocumentData } from "firebase-admin/firestore";
import type { MemberAvailability } from "@/domain/entities/MemberAvailability";
import type { IMemberAvailabilityRepository } from "@/domain/ports/IMemberAvailabilityRepository";
import {
  memberAvailabilityFromPersistence,
  memberAvailabilityToPersistence,
} from "../mappers/memberAvailabilityMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MemberAvailabilityFirebaseRepository
  extends BaseFirebaseRepository<MemberAvailability>
  implements IMemberAvailabilityRepository
{
  constructor() {
    super("memberAvailabilities");
  }

  protected toEntity(data: DocumentData, id: string): MemberAvailability {
    return memberAvailabilityFromPersistence(data, id);
  }

  protected toFirestoreData(entity: MemberAvailability): DocumentData {
    return memberAvailabilityToPersistence(entity);
  }

  private buildDocumentId(memberId: string, churchId: string): string {
    return `${churchId}_${memberId}`;
  }

  async create(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async update(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async findByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<MemberAvailability | null> {
    const docId = this.buildDocumentId(memberId, churchId);
    return this.findById(docId);
  }

  async findByChurchId(churchId: string): Promise<MemberAvailability[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();

    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async upsert(entity: MemberAvailability): Promise<MemberAvailability> {
    const docId = this.buildDocumentId(entity.memberId, entity.churchId);
    const data = this.toFirestoreData(entity);

    await this.collection.doc(docId).set(data, { merge: true });

    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async deleteByMemberAndChurch(
    memberId: string,
    churchId: string,
  ): Promise<void> {
    const docId = this.buildDocumentId(memberId, churchId);
    await this.collection.doc(docId).set({ deletedAt: new Date() }, { merge: true });
  }
}
