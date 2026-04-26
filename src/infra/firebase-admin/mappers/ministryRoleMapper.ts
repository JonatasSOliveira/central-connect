import type { DocumentData } from "firebase-admin/firestore";
import {
  MinistryRole,
  type MinistryRoleParams,
} from "@/domain/entities/MinistryRole";
import { DEFAULT_MINISTRY_ROLE_REQUIRED_COUNT } from "@/shared/constants/scaleRules";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function ministryRoleToPersistence(
  ministryRole: MinistryRole,
): DocumentData {
  return convertDatesToTimestamps({
    ministryId: ministryRole.ministryId,
    name: ministryRole.name,
    requiredCount: ministryRole.requiredCount,
    createdAt: ministryRole.createdAt,
    updatedAt: ministryRole.updatedAt,
    deletedAt: ministryRole.deletedAt,
  });
}

export function ministryRoleFromPersistence(
  data: DocumentData,
  id: string,
): MinistryRole {
  const convertedData = convertTimestampsToDates(data);
  const params: MinistryRoleParams = {
    id,
    ministryId: convertedData.ministryId ?? "",
    name: convertedData.name ?? "",
    requiredCount:
      convertedData.requiredCount ?? DEFAULT_MINISTRY_ROLE_REQUIRED_COUNT,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new MinistryRole(params);
}
