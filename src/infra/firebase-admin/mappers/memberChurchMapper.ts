import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberChurch,
  type MemberChurchParams,
} from "@/domain/entities/MemberChurch";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberChurchToPersistence(
  memberChurch: MemberChurch,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberChurch.memberId,
    churchId: memberChurch.churchId,
    roleId: memberChurch.roleId,
    createdAt: memberChurch.createdAt,
    updatedAt: memberChurch.updatedAt,
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
