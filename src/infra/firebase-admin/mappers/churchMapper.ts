import type { DocumentData } from "firebase-admin/firestore";
import { Church, type ChurchParams } from "@/domain/entities/Church";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function churchToPersistence(church: Church): DocumentData {
  return convertDatesToTimestamps({
    name: church.name,
    selfSignupDefaultRoleId: church.selfSignupDefaultRoleId,
    maxConsecutiveScalesPerMember: church.maxConsecutiveScalesPerMember,
    createdAt: church.createdAt,
    updatedAt: church.updatedAt,
    deletedAt: church.deletedAt,
  });
}

export function churchFromPersistence(data: DocumentData, id: string): Church {
  const convertedData = convertTimestampsToDates(data);
  const params: ChurchParams = {
    id,
    name: convertedData.name ?? "",
    selfSignupDefaultRoleId: convertedData.selfSignupDefaultRoleId ?? null,
    maxConsecutiveScalesPerMember:
      convertedData.maxConsecutiveScalesPerMember ??
      DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new Church(params);
}
