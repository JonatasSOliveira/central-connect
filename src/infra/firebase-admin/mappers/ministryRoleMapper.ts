import type { DocumentData } from "firebase-admin/firestore";
import {
  MinistryRole,
  type MinistryRoleParams,
} from "@/domain/entities/MinistryRole";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function ministryRoleToPersistence(
  ministryRole: MinistryRole,
): DocumentData {
  return convertDatesToTimestamps({
    churchId: ministryRole.churchId,
    ministryId: ministryRole.ministryId,
    name: ministryRole.name,
    createdAt: ministryRole.createdAt,
    updatedAt: ministryRole.updatedAt,
<<<<<<< Updated upstream
=======
    deletedAt: ministryRole.deletedAt,
>>>>>>> Stashed changes
  });
}

export function ministryRoleFromPersistence(
  data: DocumentData,
  id: string,
): MinistryRole {
  const convertedData = convertTimestampsToDates(data);
  const params: MinistryRoleParams = {
    id,
    churchId: convertedData.churchId ?? "",
    ministryId: convertedData.ministryId ?? "",
    name: convertedData.name ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new MinistryRole(params);
}
