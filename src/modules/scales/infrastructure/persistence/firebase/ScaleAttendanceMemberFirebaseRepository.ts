import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IScaleAttendanceMemberRepository } from "@/modules/scales/application/ports/IScaleAttendanceMemberRepository";
import type { ScaleAttendanceMember } from "@/modules/scales/domain/entities/ScaleAttendanceMember";
import {
  scaleAttendanceMemberFromPersistence,
  scaleAttendanceMemberToPersistence,
} from "@/modules/scales/infrastructure/mappers/scaleAttendanceMemberMapper";

export class ScaleAttendanceMemberFirebaseRepository
  extends BaseFirebaseRepository<ScaleAttendanceMember>
  implements IScaleAttendanceMemberRepository
{
  private static readonly IN_QUERY_LIMIT = 10;

  constructor() {
    super("scaleAttendanceMembers");
  }

  protected toEntity(data: DocumentData, id: string): ScaleAttendanceMember {
    return scaleAttendanceMemberFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ScaleAttendanceMember): DocumentData {
    return scaleAttendanceMemberToPersistence(entity);
  }

  async findByScaleAttendanceId(
    scaleAttendanceId: string,
  ): Promise<ScaleAttendanceMember[]> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleAttendanceId", "==", scaleAttendanceId)
      .get();

    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByScaleMemberId(
    scaleMemberId: string,
  ): Promise<ScaleAttendanceMember | null> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleMemberId", "==", scaleMemberId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByScaleId(scaleId: string): Promise<ScaleAttendanceMember[]> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleId", "==", scaleId)
      .get();

    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByScaleIds(scaleIds: string[]): Promise<ScaleAttendanceMember[]> {
    if (scaleIds.length === 0) {
      return [];
    }

    const chunks: string[][] = [];

    for (
      let i = 0;
      i < scaleIds.length;
      i += ScaleAttendanceMemberFirebaseRepository.IN_QUERY_LIMIT
    ) {
      chunks.push(
        scaleIds.slice(
          i,
          i + ScaleAttendanceMemberFirebaseRepository.IN_QUERY_LIMIT,
        ),
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
