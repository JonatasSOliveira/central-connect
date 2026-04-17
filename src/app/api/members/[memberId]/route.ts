import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { memberContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../../_lib/auth";

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

function buildUserChurches(
  isSuperAdmin: boolean,
  userChurches: { churchId: string; roleId: string | null }[],
  permissions: string[],
  selectedChurchId: string | null,
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
    hasMemberRead:
      c.churchId === selectedChurchId &&
      permissions.includes(Permission.MEMBER_READ),
    hasMemberWrite:
      c.churchId === selectedChurchId &&
      permissions.includes(Permission.MEMBER_WRITE),
  }));
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { memberId } = await params;

  const result = await memberContainer.getMember.execute({
    memberId,
    isSuperAdmin: user.isSuperAdmin,
    userChurches: buildUserChurches(
      user.isSuperAdmin,
      user.churches,
      user.permissions,
      user.churchId,
    ),
  });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { memberId } = await params;

  const canEditMember =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.MEMBER_WRITE) ||
    (user.permissions.includes(Permission.MEMBER_SELF_WRITE) &&
      memberId === user.memberId);

  if (!canEditMember) {
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

  const { UpdateMemberInputSchema } = await import(
    "@/application/dtos/member/CreateMemberDTO"
  );
  const parsed = UpdateMemberInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  if (!user.isSuperAdmin && parsed.data.churches) {
    const userWritableChurchIds = user.churches
      .filter((church) => church.churchId === user.churchId)
      .filter(() => user.permissions.includes(Permission.MEMBER_WRITE))
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

  const result = await memberContainer.updateMember.execute({
    memberId,
    input: parsed.data,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { memberId } = await params;

  const canDeleteMember =
    user.isSuperAdmin || user.permissions.includes(Permission.MEMBER_DELETE);

  if (!canDeleteMember) {
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
  }

  const result = await memberContainer.deleteMember.execute({ memberId });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return new NextResponse(null, { status: 204 });
}
