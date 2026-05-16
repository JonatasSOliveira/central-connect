import { FieldPath, type DocumentData } from "firebase-admin/firestore";
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

    const uniqueIds = Array.from(new Set(ids));
    const chunkSize = 10;
    const idChunks: string[][] = [];

    for (let index = 0; index < uniqueIds.length; index += chunkSize) {
      idChunks.push(uniqueIds.slice(index, index + chunkSize));
    }

    const snapshots = await Promise.all(
      idChunks.map((chunk) =>
        this.buildActiveQuery()
          .where(FieldPath.documentId(), "in", chunk)
          .get(),
      ),
    );

    const mapped = snapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => this.toEntity(doc.data() as DocumentData, doc.id)),
    );

    const churchesById = new Map(mapped.map((church) => [church.id, church]));
    return uniqueIds
      .map((id) => churchesById.get(id) ?? null)
      .filter((church): church is Church => church !== null);
  }
}
