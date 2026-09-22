import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  MemberMinistryRole,
  type MemberMinistryRoleParams,
} from "@/modules/members/domain/entities/MemberMinistryRole";

export function memberMinistryRoleToPersistence(
  memberMinistryRole: MemberMinistryRole,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberMinistryRole.memberId,
    churchId: memberMinistryRole.churchId,
    ministryId: memberMinistryRole.ministryId,
    ministryRoleId: memberMinistryRole.ministryRoleId,
    createdAt: memberMinistryRole.createdAt,
    updatedAt: memberMinistryRole.updatedAt,
    deletedAt: memberMinistryRole.deletedAt,
  });
}

export function memberMinistryRoleFromPersistence(
  data: DocumentData,
  id: string,
): MemberMinistryRole {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberMinistryRoleParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    ministryId: convertedData.ministryId ?? "",
    ministryRoleId: convertedData.ministryRoleId ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new MemberMinistryRole(params);
}
