import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberServiceAvailability,
  type MemberServiceAvailabilityParams,
} from "@/domain/entities/MemberServiceAvailability";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberServiceAvailabilityToPersistence(
  availability: MemberServiceAvailability,
): DocumentData {
  return convertDatesToTimestamps({
    memberId: availability.memberId,
    churchId: availability.churchId,
    slot: availability.slot,
    createdAt: availability.createdAt,
    updatedAt: availability.updatedAt,
    deletedAt: availability.deletedAt,
  });
}

export function memberServiceAvailabilityFromPersistence(
  data: DocumentData,
  id: string,
): MemberServiceAvailability {
  const convertedData = convertTimestampsToDates(data);
  const params: MemberServiceAvailabilityParams = {
    id,
    memberId: convertedData.memberId ?? "",
    churchId: convertedData.churchId ?? "",
    slot: convertedData.slot,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
    deletedAt: convertedData.deletedAt ?? null,
  };
  return new MemberServiceAvailability(params);
}
