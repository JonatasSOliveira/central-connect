import type { DocumentData } from "firebase-admin/firestore";
import type { Church } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import {
  churchFromPersistence,
  churchToPersistence,
} from "../mappers/churchMapper";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ChurchFirebaseRepository
  extends BaseFirebaseRepository<Church>
  implements IChurchRepository
{
  constructor() {
    super("churches");
  }

  protected toEntity(data: DocumentData, id: string): Church {
    return churchFromPersistence(data, id);
  }

  protected toFirestoreData(entity: Church): DocumentData {
    return churchToPersistence(entity);
  }

  async findByIds(ids: string[]): Promise<Church[]> {
    if (ids.length === 0) return [];

    const churches = await Promise.all(ids.map((id) => this.findById(id)));

    return churches.filter((c): c is Church => c !== null);
  }
}
