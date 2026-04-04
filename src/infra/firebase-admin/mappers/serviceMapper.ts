import type { DocumentData } from "firebase-admin/firestore";
import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import { Service, type ServiceParams } from "@/domain/entities/Service";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function serviceToPersistence(service: Service): DocumentData {
  return convertDatesToTimestamps({
    churchId: service.churchId,
    serviceTemplateId: service.serviceTemplateId,
    title: service.title,
    dayOfWeek: service.dayOfWeek,
    shift: service.shift,
    time: service.time,
    date: service.date,
    location: service.location,
    description: service.description,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    deletedAt: service.deletedAt,
  });
}

export function serviceFromPersistence(
  data: DocumentData,
  id: string,
): Service {
  const convertedData = convertTimestampsToDates(data);
  const params: ServiceParams = {
    id,
    churchId: convertedData.churchId ?? "",
    serviceTemplateId: convertedData.serviceTemplateId ?? null,
    title: convertedData.title ?? "",
    dayOfWeek: (convertedData.dayOfWeek ?? "Sunday") as DayOfWeek,
    shift: convertedData.shift ?? "",
    time: convertedData.time ?? "",
    date: convertedData.date ?? new Date(),
    location: convertedData.location ?? null,
    description: convertedData.description ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };
  return new Service(params);
}
