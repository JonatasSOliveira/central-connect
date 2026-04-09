import type { DocumentData } from "firebase-admin/firestore";
import {
  ScaleAttendance,
  type ScaleAttendanceParams,
} from "@/domain/entities/ScaleAttendance";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function scaleAttendanceToPersistence(
  attendance: ScaleAttendance,
): DocumentData {
  return convertDatesToTimestamps({
    churchId: attendance.churchId,
    scaleId: attendance.scaleId,
    status: attendance.status,
    publishedAt: attendance.publishedAt,
    publishedByUserId: attendance.publishedByUserId,
    createdByUserId: attendance.createdByUserId,
    updatedByUserId: attendance.updatedByUserId,
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt,
    deletedAt: attendance.deletedAt,
  });
}

export function scaleAttendanceFromPersistence(
  data: DocumentData,
  id: string,
): ScaleAttendance {
  const convertedData = convertTimestampsToDates(data);
  const params: ScaleAttendanceParams = {
    id,
    churchId: convertedData.churchId ?? "",
    scaleId: convertedData.scaleId ?? "",
    status: convertedData.status ?? "draft",
    publishedAt: convertedData.publishedAt ?? null,
    publishedByUserId: convertedData.publishedByUserId ?? null,
    createdByUserId: convertedData.createdByUserId ?? null,
    updatedByUserId: convertedData.updatedByUserId ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };
  return new ScaleAttendance(params);
}
