import type { DocumentData } from "firebase-admin/firestore";
import type { Scale } from "@/domain/entities/Scale";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import {
  scaleFromPersistence,
  scaleToPersistence,
} from "../mappers/scaleMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ScaleFirebaseRepository
  extends BaseFirebaseRepository<Scale>
  implements IScaleRepository
{
  constructor() {
    super("scales");
  }

  protected toEntity(data: DocumentData, id: string): Scale {
    return scaleFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Scale): DocumentData {
    return scaleToPersistence(entity);
  }

  async findByChurchId(churchId: string): Promise<Scale[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByServiceAndMinistry(
    churchId: string,
    serviceId: string,
    ministryId: string,
    excludeId?: string,
  ): Promise<Scale | null> {
    const query = this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .where("serviceId", "==", serviceId)
      .where("ministryId", "==", ministryId)
      .limit(1);

    const snapshot = await query.get();

    if (snapshot.empty) return null;

    if (excludeId) {
      const filtered = snapshot.docs.filter((doc) => doc.id !== excludeId);
      if (filtered.length === 0) return null;
      return this.toEntity(filtered[0].data() as DocumentData, filtered[0].id);
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }

  async findByFilters(
    churchId: string,
    filters: { serviceId?: string; ministryId?: string },
  ): Promise<Scale[]> {
    let query = this.buildActiveQuery().where("churchId", "==", churchId);

    if (filters.serviceId) {
      query = query.where("serviceId", "==", filters.serviceId);
    }

    if (filters.ministryId) {
      query = query.where("ministryId", "==", filters.ministryId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
