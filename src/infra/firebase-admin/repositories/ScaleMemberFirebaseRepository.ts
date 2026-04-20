import type { DocumentData } from "firebase-admin/firestore";
import type { ScaleMember } from "@/domain/entities/ScaleMember";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import {
  scaleMemberFromPersistence,
  scaleMemberToPersistence,
} from "../mappers/scaleMemberMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ScaleMemberFirebaseRepository
  extends BaseFirebaseRepository<ScaleMember>
  implements IScaleMemberRepository
{
  private static readonly IN_QUERY_LIMIT = 10;

  constructor() {
    super("scale_members");
  }

  protected toEntity(data: DocumentData, id: string): ScaleMember {
    return scaleMemberFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ScaleMember): DocumentData {
    return scaleMemberToPersistence(entity);
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
