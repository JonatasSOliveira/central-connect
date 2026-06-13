import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberPersonalInfo,
  type MemberPersonalInfoParams,
} from "@/domain/entities/MemberPersonalInfo";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberPersonalInfoToPersistence(
  personalInfo: MemberPersonalInfo,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: personalInfo.memberId,
    churchId: personalInfo.churchId,
    maritalStatus: personalInfo.maritalStatus,
    hasChildren: personalInfo.hasChildren,
    childrenCount: personalInfo.childrenCount,
    childrenAges: personalInfo.childrenAges,
    neighborhood: personalInfo.neighborhood,
    createdAt: personalInfo.createdAt,
    updatedAt: personalInfo.updatedAt,
    deletedAt: personalInfo.deletedAt,
  });
}

export function memberPersonalInfoFromPersistence(
  data: DocumentData,
  id: string,
): MemberPersonalInfo {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberPersonalInfoParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    maritalStatus: convertedData.maritalStatus,
    hasChildren: convertedData.hasChildren ?? false,
    childrenCount: convertedData.childrenCount ?? null,
    childrenAges: convertedData.childrenAges ?? null,
    neighborhood: convertedData.neighborhood ?? "",
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberPersonalInfo(params);
}
