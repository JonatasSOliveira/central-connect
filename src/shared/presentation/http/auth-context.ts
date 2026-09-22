import type { SessionPayload } from "@/shared/contracts/auth";

export function getChurchIdFromSession(
  user: SessionPayload,
  queryChurchId: string | null,
): string | null {
  if (user.isSuperAdmin) return queryChurchId ?? user.churchId;
  if (queryChurchId && queryChurchId !== user.churchId) return null;
  return user.churchId;
}

export function hasPermission(
  user: SessionPayload,
  permission: string,
): boolean {
  return user.isSuperAdmin || user.permissions.includes(permission);
}

export function canAccessChurch(
  user: SessionPayload,
  churchId: string,
): boolean {
  return (
    user.isSuperAdmin || user.churches.some((c) => c.churchId === churchId)
  );
}
