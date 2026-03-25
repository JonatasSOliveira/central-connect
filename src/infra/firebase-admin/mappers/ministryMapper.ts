import type { DocumentData } from "firebase-admin/firestore";
import { Ministry, type MinistryParams } from "@/domain/entities/Ministry";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function ministryToPersistence(ministry: Ministry): DocumentData {
  return convertDatesToTimestamps({
    churchId: ministry.churchId,
    name: ministry.name,
    liderId: ministry.liderId,
    minMembersPerService: ministry.minMembersPerService,
    idealMembersPerService: ministry.idealMembersPerService,
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
    liderId: convertedData.liderId ?? null,
    minMembersPerService: convertedData.minMembersPerService ?? 1,
    idealMembersPerService: convertedData.idealMembersPerService ?? 2,
    notes: convertedData.notes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Ministry(params);
}
