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

  private buildDocumentId(memberId: string): string {
    return memberId;
  }

  async create(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async update(entity: MemberAvailability): Promise<MemberAvailability> {
    return this.upsert(entity);
  }

  async findByMemberId(memberId: string): Promise<MemberAvailability | null> {
    const docId = this.buildDocumentId(memberId);
    const currentDoc = await this.findById(docId);
    if (currentDoc) {
      return currentDoc;
    }

    const legacySnapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .get();

    if (legacySnapshot.empty) {
      return null;
    }

    const sortedDocs = [...legacySnapshot.docs].sort((a, b) => {
      const aData = a.data() as DocumentData;
      const bData = b.data() as DocumentData;
      const aUpdatedAt = aData.updatedAt?.toDate?.() ?? new Date(0);
      const bUpdatedAt = bData.updatedAt?.toDate?.() ?? new Date(0);
      return bUpdatedAt.getTime() - aUpdatedAt.getTime();
    });

    const latestLegacy = this.toEntity(
      sortedDocs[0].data() as DocumentData,
      sortedDocs[0].id,
    );

    await this.collection.doc(docId).set(this.toFirestoreData(latestLegacy), {
      merge: true,
    });

    return this.findById(docId);
  }

  async findByMemberIds(memberIds: string[]): Promise<MemberAvailability[]> {
    if (memberIds.length === 0) {
      return [];
    }

    const docs = await Promise.all(memberIds.map((memberId) => this.findByMemberId(memberId)));

    return docs.filter((item): item is MemberAvailability => item !== null);
  }

  async upsert(entity: MemberAvailability): Promise<MemberAvailability> {
    const docId = this.buildDocumentId(entity.memberId);
    const data = this.toFirestoreData(entity);

    await this.collection.doc(docId).set(data, { merge: true });

    const doc = await this.collection.doc(docId).get();
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async deleteByMemberId(memberId: string): Promise<void> {
    const docId = this.buildDocumentId(memberId);
    await this.collection.doc(docId).set({ deletedAt: new Date() }, { merge: true });
  }
}
