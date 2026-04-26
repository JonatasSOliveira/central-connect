import type { DocumentData } from "firebase-admin/firestore";
import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import {
  ServiceTemplate,
  type ServiceTemplateParams,
} from "@/domain/entities/ServiceTemplate";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function serviceTemplateToPersistence(
  template: ServiceTemplate,
): DocumentData {
  return convertDatesToTimestamps({
    churchId: template.churchId,
    title: template.title,
    dayOfWeek: template.dayOfWeek,
    time: template.time,
    location: template.location,
    isActive: template.isActive,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    deletedAt: template.deletedAt,
  });
}

export function serviceTemplateFromPersistence(
  data: DocumentData,
  id: string,
): ServiceTemplate {
  const convertedData = convertTimestampsToDates(data);
  const params: ServiceTemplateParams = {
    id,
    churchId: convertedData.churchId ?? "",
    title: convertedData.title ?? "",
    dayOfWeek: (convertedData.dayOfWeek ?? "Sunday") as DayOfWeek,
    time: convertedData.time ?? "",
    location: convertedData.location ?? null,
    isActive: convertedData.isActive ?? true,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt,
  };
  return new ServiceTemplate(params);
}
