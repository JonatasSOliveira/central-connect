import type { DocumentData } from "firebase-admin/firestore";
import { Church, type ChurchParams } from "@/domain/entities/Church";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function churchToPersistence(church: Church): DocumentData {
  return convertDatesToTimestamps({
    name: church.name,
    createdAt: church.createdAt,
    updatedAt: church.updatedAt,
  });
}

export function churchFromPersistence(data: DocumentData, id: string): Church {
  const convertedData = convertTimestampsToDates(data);
  const params: ChurchParams = {
    id,
    name: convertedData.name ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Church(params);
}
