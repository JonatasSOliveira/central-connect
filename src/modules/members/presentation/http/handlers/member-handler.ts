import { type NextRequest, NextResponse } from "next/server";
import { canEditMember } from "@/app/api/members/_lib/canEditMember";
import type { DeleteMember } from "@/modules/members/application/use-cases/DeleteMember";
import type { GetMember } from "@/modules/members/application/use-cases/GetMember";
import type { UpdateMember } from "@/modules/members/application/use-cases/UpdateMember";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { UpdateMemberInputSchema } from "../schemas/member-schema";

interface UseCases {
  getMember: GetMember;
  updateMember: UpdateMember;
  deleteMember: DeleteMember;
}
function memberships(
  user: Extract<AuthResult, { ok: true }>["user"],
  canReadOwn: boolean,
) {
  return user.isSuperAdmin
    ? user.churches.map((church) => ({
        ...church,
        hasMemberRead: true,
        hasMemberWrite: true,
      }))
    : user.churches.map((church) => ({
        ...church,
        hasMemberRead:
          canReadOwn ||
          (church.churchId === user.churchId &&
            user.permissions.includes(Permission.MEMBER_READ)),
        hasMemberWrite:
          church.churchId === user.churchId &&
          user.permissions.includes(Permission.MEMBER_WRITE),
      }));
}

export function createMemberHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    GET: async (_request: NextRequest, memberId: string) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      const result = await useCases.getMember.execute({
        memberId,
        isSuperAdmin: auth.user.isSuperAdmin,
        userChurches: memberships(
          auth.user,
          memberId === auth.user.memberId &&
            auth.user.permissions.includes(Permission.MEMBER_SELF_WRITE),
        ),
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    PUT: async (request: NextRequest, memberId: string) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (!canEditMember(auth.user, memberId))
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para editar este membro",
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
      const parsed = UpdateMemberInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const canManageChurches =
        auth.user.isSuperAdmin ||
        auth.user.permissions.includes(Permission.MEMBER_WRITE);
      const canEditOwnMinistries =
        memberId === auth.user.memberId &&
        auth.user.permissions.includes(Permission.MEMBER_SELF_WRITE);
      if (parsed.data.churches && parsed.data.ministryAssignments)
        return NextResponse.json(apiError("VALIDATION_ERROR"), { status: 400 });
      if (parsed.data.churches && !canManageChurches)
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para editar cargos deste membro",
            },
          },
          { status: 403 },
        );
      if (
        parsed.data.ministryAssignments &&
        !canManageChurches &&
        !canEditOwnMinistries
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para editar ministérios deste membro",
            },
          },
          { status: 403 },
        );
      if (
        !auth.user.isSuperAdmin &&
        parsed.data.churches?.some(
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
      const result = await useCases.updateMember.execute({
        memberId,
        input: parsed.data,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    DELETE: async (_request: NextRequest, memberId: string) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.MEMBER_DELETE)
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para excluir este membro",
            },
          },
          { status: 403 },
        );
      const result = await useCases.deleteMember.execute({
        memberId,
        churchId: auth.user.churchId,
        isSuperAdmin: auth.user.isSuperAdmin,
      });
      if (!result.ok)
        return NextResponse.json(result, {
          status: getHttpStatus(result.error?.code),
        });
      return new NextResponse(null, { status: 204 });
    },
  };
}
