import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberMinistryInterest,
  type MemberMinistryInterestParams,
} from "@/domain/entities/MemberMinistryInterest";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberMinistryInterestToPersistence(
  interest: MemberMinistryInterest,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: interest.memberId,
    churchId: interest.churchId,
    ministryId: interest.ministryId,
    createdAt: interest.createdAt,
    updatedAt: interest.updatedAt,
    deletedAt: interest.deletedAt,
  });
}

export function memberMinistryInterestFromPersistence(
  data: DocumentData,
  id: string,
): MemberMinistryInterest {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberMinistryInterestParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    ministryId: convertedData.ministryId ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberMinistryInterest(params);
}
