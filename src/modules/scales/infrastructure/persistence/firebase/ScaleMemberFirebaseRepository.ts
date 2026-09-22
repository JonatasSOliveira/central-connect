import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { ScaleMember } from "@/modules/scales/domain/entities/ScaleMember";
import {
  scaleMemberFromPersistence,
  scaleMemberToPersistence,
} from "@/modules/scales/infrastructure/mappers/scaleMemberMapper";

export class ScaleMemberFirebaseRepository
  extends BaseFirebaseRepository<ScaleMember>
  implements IScaleMemberRepository
{
  private static readonly IN_QUERY_LIMIT = 10;

  constructor() {
    super("scaleMembers");
  }

  protected toEntity(data: DocumentData, id: string): ScaleMember {
    return scaleMemberFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ScaleMember): DocumentData {
    return scaleMemberToPersistence(entity);
  }

  async findByMemberId(memberId: string): Promise<ScaleMember[]> {
    const snapshot = await this.buildActiveQuery()
      .where("memberId", "==", memberId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByScaleId(scaleId: string): Promise<ScaleMember[]> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleId", "==", scaleId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByScaleIds(scaleIds: string[]): Promise<ScaleMember[]> {
    if (scaleIds.length === 0) {
      return [];
    }

    const chunks: string[][] = [];

    for (
      let i = 0;
      i < scaleIds.length;
      i += ScaleMemberFirebaseRepository.IN_QUERY_LIMIT
    ) {
      chunks.push(
        scaleIds.slice(i, i + ScaleMemberFirebaseRepository.IN_QUERY_LIMIT),
      );
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        this.buildActiveQuery().where("scaleId", "in", chunk).get(),
      ),
    );

    return snapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) =>
        this.toEntity(doc.data() as DocumentData, doc.id),
      ),
    );
  }

  async deleteByScaleId(scaleId: string): Promise<void> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleId", "==", scaleId)
      .get();

    const batch = this.collection.firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { deletedAt: new Date() });
    });

    await batch.commit();
  }
}
