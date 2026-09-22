import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  Scale,
  type ScaleParams,
} from "@/modules/scales/domain/entities/Scale";

export function scaleToPersistence(scale: Scale): DocumentData {
  return convertDatesToTimestamps({
    churchId: scale.churchId,
    serviceId: scale.serviceId,
    ministryId: scale.ministryId,
    status: scale.status,
    notes: scale.notes,
    createdAt: scale.createdAt,
    updatedAt: scale.updatedAt,
    deletedAt: scale.deletedAt,
  });
}

export function scaleFromPersistence(data: DocumentData, id: string): Scale {
  const convertedData = convertTimestampsToDates(data);
  const params: ScaleParams = {
    id,
    churchId: convertedData.churchId ?? "",
    serviceId: convertedData.serviceId ?? "",
    ministryId: convertedData.ministryId ?? "",
    status: convertedData.status ?? "draft",
    notes: convertedData.notes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Scale(params);
}
