import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/modules/scales/domain/entities/ScaleMember";

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
