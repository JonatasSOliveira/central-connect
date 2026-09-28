import type { memberPushTokens } from "@/infra/database/drizzle/schema";
import {
  MemberPushToken,
  type MemberPushTokenParams,
} from "@/modules/notifications/domain/entities/MemberPushToken";

export function memberPushTokenFromDrizzle(
  row: typeof memberPushTokens.$inferSelect,
): MemberPushToken {
  const params: MemberPushTokenParams = {
    id: row.id,
    churchId: row.churchId,
    memberId: row.memberId,
    token: row.token,
    deviceId: row.deviceId,
    platform: row.platform as "web",
    isActive: row.isActive,
    failureCount: row.failureCount,
    lastSeenAt: row.lastSeenAt,
    lastFailureAt: row.lastFailureAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };

  return new MemberPushToken(params);
}

export function memberPushTokenToDrizzle(token: MemberPushToken) {
  return {
    id: token.id,
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
  };
}
