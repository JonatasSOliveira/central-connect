import type { DocumentData } from "firebase-admin/firestore";
import type { ScaleAttendanceMember } from "@/domain/entities/ScaleAttendanceMember";
import type { IScaleAttendanceMemberRepository } from "@/domain/ports/IScaleAttendanceMemberRepository";
import {
  scaleAttendanceMemberFromPersistence,
  scaleAttendanceMemberToPersistence,
} from "../mappers/scaleAttendanceMemberMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ScaleAttendanceMemberFirebaseRepository
  extends BaseFirebaseRepository<ScaleAttendanceMember>
  implements IScaleAttendanceMemberRepository
{
  constructor() {
    super("scale_attendance_members");
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
