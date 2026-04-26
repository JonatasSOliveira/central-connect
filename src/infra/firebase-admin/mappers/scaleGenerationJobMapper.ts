import type { DocumentData } from "firebase-admin/firestore";
import {
  ScaleGenerationJob,
  type ScaleGenerationJobParams,
  type ScaleGenerationJobStatus,
} from "@/domain/entities/ScaleGenerationJob";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function scaleGenerationJobToPersistence(
  job: ScaleGenerationJob,
): DocumentData {
  return convertDatesToTimestamps({
    churchId: job.churchId,
    serviceId: job.serviceId,
    status: job.status,
    scheduledFor: job.scheduledFor,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    leaseExpiresAt: job.leaseExpiresAt,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    deletedAt: job.deletedAt,
  });
}

export function scaleGenerationJobFromPersistence(
  data: DocumentData,
  id: string,
): ScaleGenerationJob {
  const convertedData = convertTimestampsToDates(data);
  const params: ScaleGenerationJobParams = {
    id,
    churchId: convertedData.churchId ?? "",
    serviceId: convertedData.serviceId ?? null,
    status: (convertedData.status ?? "pending") as ScaleGenerationJobStatus,
    scheduledFor: convertedData.scheduledFor ?? new Date(),
    startedAt: convertedData.startedAt ?? null,
    completedAt: convertedData.completedAt ?? null,
    leaseExpiresAt: convertedData.leaseExpiresAt ?? null,
    error: convertedData.error ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };
  return new ScaleGenerationJob(params);
}