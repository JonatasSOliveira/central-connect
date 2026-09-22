import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/modules/members/domain/entities/MemberChurch";

export function memberChurchToPersistence(
  memberChurch: MemberChurch,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberChurch.memberId,
    churchId: memberChurch.churchId,
    roleId: memberChurch.roleId,
    createdAt: memberChurch.createdAt,
    updatedAt: memberChurch.updatedAt,
    deletedAt: memberChurch.deletedAt,
  });
}

export function memberChurchFromPersistence(
  data: DocumentData,
  id: string,
): MemberChurch {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberChurchParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    roleId: convertedData.roleId ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new MemberChurch(params);
}
