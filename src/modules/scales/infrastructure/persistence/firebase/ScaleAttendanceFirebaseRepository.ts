import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IScaleAttendanceRepository } from "@/modules/scales/application/ports/IScaleAttendanceRepository";
import type { ScaleAttendance } from "@/modules/scales/domain/entities/ScaleAttendance";
import {
  scaleAttendanceFromPersistence,
  scaleAttendanceToPersistence,
} from "@/modules/scales/infrastructure/mappers/scaleAttendanceMapper";

export class ScaleAttendanceFirebaseRepository
  extends BaseFirebaseRepository<ScaleAttendance>
  implements IScaleAttendanceRepository
{
  private static readonly IN_QUERY_LIMIT = 10;

  constructor() {
    super("scaleAttendances");
  }

  protected toEntity(data: DocumentData, id: string): ScaleAttendance {
    return scaleAttendanceFromPersistence(data, id);
  }

  protected toFirestoreData(entity: ScaleAttendance): DocumentData {
    return scaleAttendanceToPersistence(entity);
  }

  async findByScaleId(scaleId: string): Promise<ScaleAttendance | null> {
    const snapshot = await this.buildActiveQuery()
      .where("scaleId", "==", scaleId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByScaleIds(scaleIds: string[]): Promise<ScaleAttendance[]> {
    if (scaleIds.length === 0) {
      return [];
    }

    const chunks: string[][] = [];

    for (
      let i = 0;
      i < scaleIds.length;
      i += ScaleAttendanceFirebaseRepository.IN_QUERY_LIMIT
    ) {
      chunks.push(
        scaleIds.slice(i, i + ScaleAttendanceFirebaseRepository.IN_QUERY_LIMIT),
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
}
