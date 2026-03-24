import type { DocumentData } from "firebase-admin/firestore";
import type { Ministry } from "@/domain/entities/Ministry";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import {
  ministryFromPersistence,
  ministryToPersistence,
} from "../mappers/ministryMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class MinistryFirebaseRepository
  extends BaseFirebaseRepository<Ministry>
  implements IMinistryRepository
{
  constructor() {
    super("ministries");
  }

  protected toEntity(data: DocumentData, id: string): Ministry {
    return ministryFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Ministry): DocumentData {
    return ministryToPersistence(entity);
  }

  async findByChurchId(churchId: string): Promise<Ministry[]> {
    const snapshot = await this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }

  async findByChurchIdAndName(
    churchId: string,
    name: string,
    excludeId?: string,
  ): Promise<Ministry | null> {
    const query = this.buildActiveQuery()
      .where("churchId", "==", churchId)
      .where("name", "==", name)
      .limit(1);

    if (excludeId) {
      const docs = await query.get();
      const filtered = docs.docs.filter((doc) => doc.id !== excludeId);
      if (filtered.length === 0) return null;
      return this.toEntity(filtered[0].data() as DocumentData, filtered[0].id);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.toEntity(doc.data() as DocumentData, doc.id);
  }
}
