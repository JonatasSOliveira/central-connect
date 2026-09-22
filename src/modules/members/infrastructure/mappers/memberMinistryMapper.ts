import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  MemberMinistry,
  type MemberMinistryParams,
} from "@/modules/members/domain/entities/MemberMinistry";

export function memberMinistryToPersistence(
  memberMinistry: MemberMinistry,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: memberMinistry.memberId,
    churchId: memberMinistry.churchId,
    ministryId: memberMinistry.ministryId,
    createdAt: memberMinistry.createdAt,
    updatedAt: memberMinistry.updatedAt,
    deletedAt: memberMinistry.deletedAt,
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
