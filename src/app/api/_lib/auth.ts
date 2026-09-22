import { cookies } from "next/headers";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";
import { AuthErrors } from "@/modules/identity/application/errors/AuthErrors";
import type {
  AuthError,
  AuthSuccess,
  SessionPayload,
} from "@/shared/contracts/auth";

export type {
  AuthError,
  AuthSuccess,
  ChurchInfo,
  SessionPayload,
} from "@/shared/contracts/auth";

export async function validateSession(): Promise<AuthSuccess | AuthError> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return {
      ok: false,
      error: AuthErrors.UNAUTHORIZED,
    };
  }

  try {
    const tokenService = new JoseTokenJwtService();
    const session = (await tokenService.verifyToken(
      token,
    )) as unknown as SessionPayload;

    return { ok: true, user: session };
  } catch {
    return {
      ok: false,
      error: AuthErrors.INVALID_TOKEN,
    };
  }
}

export function getChurchIdFromSession(
  user: SessionPayload,
  queryChurchId: string | null,
): string | null {
  if (user.isSuperAdmin) {
    return queryChurchId ?? user.churchId;
  }

  if (queryChurchId) {
    if (queryChurchId !== user.churchId) {
      return null;
    }
    return queryChurchId;
  }

  return user.churchId;
}

export function hasPermission(
  user: SessionPayload,
  permission: string,
): boolean {
  return user.isSuperAdmin || user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: SessionPayload,
  permissions: string[],
): boolean {
  if (user.isSuperAdmin) {
    return true;
  }

  return permissions.some((permission) =>
    user.permissions.includes(permission),
  );
}

export function canAccessChurch(
  user: SessionPayload,
  churchId: string,
): boolean {
  if (user.isSuperAdmin) {
    return true;
  }

  return user.churchId === churchId;
}

export function requireSuperAdmin(user: SessionPayload): AuthError | null {
  if (!user.isSuperAdmin) {
    return {
      ok: false,
      error: AuthErrors.NOT_AUTHORIZED,
    };
  }
  return null;
}
