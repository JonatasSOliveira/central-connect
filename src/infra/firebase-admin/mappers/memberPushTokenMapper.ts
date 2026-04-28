import type { DocumentData } from "firebase-admin/firestore";
import {
  MemberPushToken,
  type MemberPushTokenParams,
} from "@/domain/entities/MemberPushToken";
import {
  convertDatesToTimestamps,
  convertTimestampsToDates,
} from "../helpers/firebaseHelpers";

export function memberPushTokenToPersistence(
  token: MemberPushToken,
): DocumentData {
  return convertDatesToTimestamps({
    churchId: token.churchId,
    memberId: token.memberId,
    token: token.token,
    deviceId: token.deviceId,
    platform: token.platform,
    isActive: token.isActive,
    failureCount: token.failureCount,
    lastSeenAt: token.lastSeenAt,
    lastFailureAt: token.lastFailureAt,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    deletedAt: token.deletedAt,
  });
}

export function memberPushTokenFromPersistence(
  data: DocumentData,
  id: string,
): MemberPushToken {
  const convertedData = convertTimestampsToDates(data);

  const params: MemberPushTokenParams = {
    id,
    churchId: convertedData.churchId ?? "",
    memberId: convertedData.memberId ?? "",
    token: convertedData.token ?? "",
    deviceId: convertedData.deviceId ?? null,
    platform: convertedData.platform ?? "web",
    isActive: convertedData.isActive ?? true,
    failureCount: convertedData.failureCount ?? 0,
    lastSeenAt: convertedData.lastSeenAt ?? null,
    lastFailureAt: convertedData.lastFailureAt ?? null,
    createdAt: convertedData.createdAt,
    updatedAt: convertedData.updatedAt,
  };

  return new MemberPushToken(params);
}
