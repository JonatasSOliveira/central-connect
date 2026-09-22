import { type NextRequest, NextResponse } from "next/server";
import { canAccessChurch, getChurchIdFromSession } from "@/app/api/_lib/auth";
import type { CreateMember } from "@/modules/members/application/use-cases/CreateMember";
import type { ListMembers } from "@/modules/members/application/use-cases/ListMembers";
import type { AuthResult, SessionPayload } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { CreateMemberInputSchema } from "../schemas/member-schema";

interface UseCases {
  listMembers: ListMembers;
  createMember: CreateMember;
}
function userChurches(user: SessionPayload) {
  return user.isSuperAdmin
    ? user.churches.map((church) => ({
        ...church,
        hasMemberRead: true,
        hasMemberWrite: true,
      }))
    : user.churches.map((church) => ({
        ...church,
        hasMemberRead:
          church.churchId === user.churchId &&
          user.permissions.includes(Permission.MEMBER_READ),
        hasMemberWrite:
          church.churchId === user.churchId &&
          user.permissions.includes(Permission.MEMBER_WRITE),
      }));
}

export function createMembersHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    GET: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      const query = new URL(request.url).searchParams;
      const churchId = getChurchIdFromSession(auth.user, query.get("churchId"));
      if (!churchId)
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NO_CHURCH_SELECTED",
              message: "Nenhuma igreja selecionada",
            },
          },
          { status: 400 },
        );
      const memberships = userChurches(auth.user);
      if (
        !canAccessChurch(auth.user, churchId) ||
        (!auth.user.isSuperAdmin &&
          !memberships.some(
            (church) => church.churchId === churchId && church.hasMemberRead,
          ))
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para acessar membros desta igreja",
            },
          },
          { status: 403 },
        );
      const result = await useCases.listMembers.execute({
        isSuperAdmin: auth.user.isSuperAdmin,
        userChurches: memberships,
        churchId,
        churchName: auth.user.churchName ?? undefined,
        ministryId: query.get("ministryId") || undefined,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    POST: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.MEMBER_WRITE)
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para criar membros",
            },
          },
          { status: 403 },
        );
      if (!request.headers.get("content-type")?.includes("application/json"))
        return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), {
          status: 400,
        });
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
      }
      const parsed = CreateMemberInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      if (
        !auth.user.isSuperAdmin &&
        parsed.data.churches.some(
          (church) => church.churchId !== auth.user.churchId,
        )
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para adicionar membros a esta igreja",
            },
          },
          { status: 403 },
        );
      const result = await useCases.createMember.execute(parsed.data);
      return NextResponse.json(result, {
        status: result.ok ? 201 : getHttpStatus(result.error?.code),
      });
    },
  };
}
