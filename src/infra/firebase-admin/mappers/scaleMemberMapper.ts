import type { DocumentData } from "firebase-admin/firestore";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/domain/entities/ScaleMember";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function scaleMemberToPersistence(member: ScaleMember): DocumentData {
  return convertDatesToTimestamps({
    scaleId: member.scaleId,
    memberId: member.memberId,
    ministryRoleId: member.ministryRoleId,
    notes: member.notes,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    deletedAt: member.deletedAt,
  });
}

export function scaleMemberFromPersistence(
  data: DocumentData,
  id: string,
): ScaleMember {
  const convertedData = convertTimestampsToDates(data);
  const params: ScaleMemberParams = {
    id,
    scaleId: convertedData.scaleId ?? "",
    memberId: convertedData.memberId ?? "",
    ministryRoleId: convertedData.ministryRoleId ?? "",
    notes: convertedData.notes ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };
  return new ScaleMember(params);
}
