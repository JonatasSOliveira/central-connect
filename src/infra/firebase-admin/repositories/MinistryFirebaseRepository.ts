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
    const snapshot = await this.collection
      .where("churchId", "==", churchId)
      .get();
    return snapshot.docs.map((doc) =>
      this.toEntity(doc.data() as DocumentData, doc.id),
    );
  }
}
