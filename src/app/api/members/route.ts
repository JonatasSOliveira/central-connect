import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { memberContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

function buildUserChurches(
  isSuperAdmin: boolean,
  userChurches: { churchId: string; roleId: string | null }[],
  permissions: string[],
): {
  churchId: string;
  roleId: string | null;
  hasMemberRead: boolean;
  hasMemberWrite: boolean;
}[] {
  if (isSuperAdmin) {
    return userChurches.map((c) => ({
      ...c,
      hasMemberRead: true,
      hasMemberWrite: true,
    }));
  }

  return userChurches.map((c) => ({
    churchId: c.churchId,
    roleId: c.roleId,
    hasMemberRead: permissions.includes(Permission.MEMBER_READ),
    hasMemberWrite: permissions.includes(Permission.MEMBER_WRITE),
  }));
}

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const churchId = searchParams.get("churchId");

  if (!churchId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "MISSING_CHURCH_ID",
          message: "churchId é obrigatório",
        },
      },
      { status: 400 },
    );
  }

  const userChurches = buildUserChurches(
    user.isSuperAdmin,
    user.churches,
    user.permissions,
  );

  const canAccessChurch =
    user.isSuperAdmin ||
    userChurches.some((c) => c.churchId === churchId && c.hasMemberRead);

  if (!canAccessChurch) {
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
  }

  const result = await memberContainer.listMembers.execute({
    isSuperAdmin: user.isSuperAdmin,
    userChurches,
    churchId,
  });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canCreateMember =
    user.isSuperAdmin || user.permissions.includes(Permission.MEMBER_WRITE);

  if (!canCreateMember) {
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
  }

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), {
      status: 400,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_JSON"), {
      status: 400,
    });
  }

  const { CreateMemberInputSchema } = await import(
    "@/application/dtos/member/CreateMemberDTO"
  );
  const parsed = CreateMemberInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  if (!user.isSuperAdmin) {
    const userWritableChurchIds = user.churches
      .filter((c) => user.permissions.includes(Permission.MEMBER_WRITE))
      .map((c) => c.churchId);

    for (const churchInfo of parsed.data.churches) {
      if (!userWritableChurchIds.includes(churchInfo.churchId)) {
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
      }
    }
  }

  const result = await memberContainer.createMember.execute(parsed.data);

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
