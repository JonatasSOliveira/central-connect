import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/domain/entities/MemberMinistry";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberMinistryToPersistence(
  memberMinistry: MemberMinistry,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberMinistry.memberId,
    churchId: memberMinistry.churchId,
    ministryId: memberMinistry.ministryId,
    createdAt: memberMinistry.createdAt,
    updatedAt: memberMinistry.updatedAt,
  });
}

export function memberMinistryFromPersistence(
  data: DocumentData,
  id: string,
): MemberMinistry {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberMinistryParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    ministryId: convertedData.ministryId ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new MemberMinistry(params);
}
