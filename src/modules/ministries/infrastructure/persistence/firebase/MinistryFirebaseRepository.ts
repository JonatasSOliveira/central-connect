import type { DocumentData } from "firebase-admin/firestore";
import { BaseFirebaseRepository } from "@/infra/firebase-admin/repositories/BaseFirebaseRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { Ministry } from "@/modules/ministries/domain/entities/Ministry";
import {
  ministryFromPersistence,
  ministryToPersistence,
} from "../../mappers/ministryMapper";

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
}
