import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  Ministry,
  type MinistryParams,
} from "@/modules/ministries/domain/entities/Ministry";

export function ministryToPersistence(ministry: Ministry): DocumentData {
  return convertDatesToTimestamps({
    churchId: ministry.churchId,
    name: ministry.name,
    leaderId: ministry.leaderId,
    notes: ministry.notes,
    createdAt: ministry.createdAt,
    updatedAt: ministry.updatedAt,
    deletedAt: ministry.deletedAt,
  });
}

export function ministryFromPersistence(
  data: DocumentData,
  id: string,
): Ministry {
  const convertedData = convertTimestampsToDates(data);
  const params: MinistryParams = {
    id,
    churchId: convertedData.churchId ?? "",
    name: convertedData.name ?? "",
    leaderId: convertedData.leaderId ?? null,
    notes: convertedData.notes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Ministry(params);
}
