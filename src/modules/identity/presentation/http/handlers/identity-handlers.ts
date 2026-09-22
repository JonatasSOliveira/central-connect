import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "@/app/api/_lib/csrf";
import { canSelectChurch } from "@/app/api/auth/_lib/canSelectChurch";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { ITokenService } from "@/modules/identity/application/ports/ITokenService";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { AuthResult, SessionPayload } from "@/shared/contracts/auth";
import { AllPermissions } from "@/shared/domain/enums/Permission";
import { getRequestId, logEvent } from "@/shared/utils/logger";

interface Dependencies {
  tokenService: ITokenService;
  churchRepository: IChurchRepository;
  memberChurchRepository: IMemberChurchRepository;
  rolePermissionRepository: IRolePermissionRepository;
}
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export function createIdentityHandlers(
  dependencies: Dependencies,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    me: async () => {
      const auth = await validateSession();
      if (!auth.ok)
        return NextResponse.json({ ok: false, value: null }, { status: 401 });
      return NextResponse.json({ ok: true, value: auth.user });
    },
    logout: async (request: NextRequest) => {
      if (!isTrustedOrigin(request))
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "UNTRUSTED_ORIGIN",
              message: "Origem da requisição não confiável",
            },
          },
          { status: 403 },
        );
      (await cookies()).delete("session");
      return NextResponse.json({ ok: true });
    },
    selectChurch: async (request: NextRequest) => {
      const requestId = getRequestId(request);
      if (!isTrustedOrigin(request))
        return NextResponse.json(
          { ok: false, error: { code: "UNTRUSTED_ORIGIN" } },
          { status: 403 },
        );
      const auth = await validateSession();
      if (!auth.ok)
        return NextResponse.json(
          { ok: false, error: { code: "NOT_AUTHENTICATED" } },
          { status: 401 },
        );
      if (!request.headers.get("content-type")?.includes("application/json"))
        return NextResponse.json(
          { ok: false, error: { code: "INVALID_CONTENT_TYPE" } },
          { status: 400 },
        );
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { ok: false, error: { code: "INVALID_JSON" } },
          { status: 400 },
        );
      }
      const churchId =
        typeof body === "object" &&
        body !== null &&
        "churchId" in body &&
        typeof body.churchId === "string"
          ? body.churchId
          : null;
      if (!churchId)
        return NextResponse.json(
          { ok: false, error: { code: "INVALID_CHURCH_ID" } },
          { status: 400 },
        );
      if (!canSelectChurch(auth.user, churchId))
        return NextResponse.json(
          { ok: false, error: { code: "NOT_AUTHORIZED" } },
          { status: 403 },
        );
      let permissions: string[] = [];
      if (auth.user.isSuperAdmin) permissions = AllPermissions;
      else {
        const memberChurch =
          await dependencies.memberChurchRepository.findByMemberIdAndChurchId(
            auth.user.memberId,
            churchId,
          );
        if (!memberChurch)
          return NextResponse.json(
            { ok: false, error: { code: "NOT_AUTHORIZED" } },
            { status: 403 },
          );
        if (memberChurch.roleId)
          permissions = (
            await dependencies.rolePermissionRepository.findByRoleId(
              memberChurch.roleId,
            )
          ).map((item) => item.permission);
      }
      const church = await dependencies.churchRepository.findById(churchId);
      const session: SessionPayload = {
        ...auth.user,
        churchId,
        churchName: church?.name ?? null,
        permissions,
      };
      const token = await dependencies.tokenService.generateToken(
        session as unknown as Record<string, unknown>,
      );
      (await cookies()).set("session", token, cookieOptions);
      logEvent("info", {
        event: "select_church_success",
        requestId,
        route: "/api/auth/select-church",
        status: 200,
        userId: auth.user.userId,
        memberId: auth.user.memberId,
        churchId,
      });
      return NextResponse.json({ ok: true, value: { churchId } });
    },
  };
}
