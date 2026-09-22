import type { SessionPayload } from "@/shared/contracts/auth";

export function hasAccessToChurch(
  user: SessionPayload,
  churchId: string,
): boolean {
  return (
    user.isSuperAdmin ||
    user.churches.some((church) => church.churchId === churchId)
  );
}

export function hasPermission(
  user: SessionPayload,
  permission: string,
): boolean {
  return user.isSuperAdmin || user.permissions.includes(permission);
}

export function resolveChurchId(
  user: SessionPayload,
  queryChurchId: string | null,
): string | null {
  if (user.isSuperAdmin) return queryChurchId ?? user.churchId;
  if (queryChurchId && queryChurchId !== user.churchId) return null;
  return user.churchId;
}

export function unauthorized(message: string) {
  return {
    ok: false as const,
    error: { code: "NOT_AUTHORIZED", message },
  };
}
