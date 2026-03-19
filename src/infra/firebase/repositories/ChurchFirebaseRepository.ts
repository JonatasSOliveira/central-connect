import type { DocumentData } from "firebase-admin/firestore";
import { Church, type ChurchParams } from "@/domain/entities/Church";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";
import { BaseFirebaseRepository } from "./BaseFirebaseRepository";

export class ChurchFirebaseRepository
  extends BaseFirebaseRepository<Church>
  implements IChurchRepository
{
  constructor() {
    super("churches");
  }

  protected toEntity(data: DocumentData, id: string): Church {
    const convertedData = convertTimestampsToDates(data);
    const params: ChurchParams = {
      id,
      name: convertedData.name ?? "",
    };
    return new Church(params);
  }

  protected toFirestoreData(entity: Church): DocumentData {
    return convertDatesToTimestamps({ ...entity });
  }
}
