import type { DocumentData } from "firebase-admin/firestore";
import type { ScaleAttendance } from "@/domain/entities/ScaleAttendance";
import type { IScaleAttendanceRepository } from "@/domain/ports/IScaleAttendanceRepository";
import {
  scaleAttendanceFromPersistence,
  scaleAttendanceToPersistence,
} from "../mappers/scaleAttendanceMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ScaleAttendanceFirebaseRepository
  extends BaseFirebaseRepository<ScaleAttendance>
  implements IScaleAttendanceRepository
{
  constructor() {
    super("scale_attendances");
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
}
