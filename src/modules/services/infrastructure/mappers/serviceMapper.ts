import type { DocumentData } from "firebase-admin/firestore";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "@/infra/firebase-admin/helpers/firebaseHelpers";
import {
  Service,
  type ServiceParams,
} from "@/modules/services/domain/entities/Service";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

export function serviceToPersistence(service: Service): DocumentData {
  return convertDatesToTimestamps({
    churchId: service.churchId,
    serviceTemplateId: service.serviceTemplateId,
    title: service.title,
    dayOfWeek: service.dayOfWeek,
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
