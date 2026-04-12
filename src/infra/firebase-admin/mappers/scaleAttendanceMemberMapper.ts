import type { DocumentData } from "firebase-admin/firestore";
import {
  ScaleAttendanceMember,
  type ScaleAttendanceMemberParams,
} from "@/domain/entities/ScaleAttendanceMember";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function scaleAttendanceMemberToPersistence(
  attendanceMember: ScaleAttendanceMember,
): DocumentData {
  return convertDatesToTimestamps({
    scaleAttendanceId: attendanceMember.scaleAttendanceId,
    scaleId: attendanceMember.scaleId,
    scaleMemberId: attendanceMember.scaleMemberId,
    memberId: attendanceMember.memberId,
    status: attendanceMember.status,
    justification: attendanceMember.justification,
    checkedAt: attendanceMember.checkedAt,
    checkedByUserId: attendanceMember.checkedByUserId,
    createdAt: attendanceMember.createdAt,
    updatedAt: attendanceMember.updatedAt,
    deletedAt: attendanceMember.deletedAt,
  });
}

export function scaleAttendanceMemberFromPersistence(
  data: DocumentData,
  id: string,
): ScaleAttendanceMember {
  const convertedData = convertTimestampsToDates(data);
  const params: ScaleAttendanceMemberParams = {
    id,
    scaleAttendanceId: convertedData.scaleAttendanceId ?? "",
    scaleId: convertedData.scaleId ?? "",
    scaleMemberId: convertedData.scaleMemberId ?? "",
    memberId: convertedData.memberId ?? "",
    status: convertedData.status ?? "present",
    justification: convertedData.justification ?? null,
    checkedAt: convertedData.checkedAt ?? null,
    checkedByUserId: convertedData.checkedByUserId ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };
  return new ScaleAttendanceMember(params);
}
