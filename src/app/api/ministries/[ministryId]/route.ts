import { type NextRequest, NextResponse } from "next/server";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { Permission } from "@/domain/enums/Permission";
import { ministryContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../../_lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ministryId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { ministryId } = await params;

  const hasReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.MINISTRY_READ);

  if (!hasReadAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar ministérios",
        },
      },
      { status: 403 },
    );
  }

  const result = await ministryContainer.getMinistry.execute({ ministryId });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ministryId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { ministryId } = await params;

  const canUpdateMinistry =
    user.isSuperAdmin || user.permissions.includes(Permission.MINISTRY_WRITE);

  if (!canUpdateMinistry) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para atualizar ministérios",
        },
      },
      { status: 403 },
    );
  }

  const getResult = await ministryContainer.getMinistry.execute({ ministryId });
  if (!getResult.ok) {
    return NextResponse.json(getResult, { status: 404 });
  }

  const ministry = getResult.value.ministry;

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (c) => c.churchId === ministry.churchId,
    );
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para atualizar ministérios desta igreja",
          },
        },
        { status: 403 },
      );
    }
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

  const parsed = MinistryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await ministryContainer.updateMinistry.execute({
    ministryId,
    churchId: ministry.churchId,
    name: parsed.data.name,
    leaderId: parsed.data.leaderId,
    minMembersPerService: parsed.data.minMembersPerService,
    idealMembersPerService: parsed.data.idealMembersPerService,
    notes: parsed.data.notes,
    roles: parsed.data.roles.map((r) => ({
      id: r.id ?? null,
      name: r.name,
    })),
    updatedByUserId: user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ ministryId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { ministryId } = await params;

  const canDeleteMinistry =
    user.isSuperAdmin || user.permissions.includes(Permission.MINISTRY_DELETE);

  if (!canDeleteMinistry) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir ministérios",
        },
      },
      { status: 403 },
    );
  }

  const getResult = await ministryContainer.getMinistry.execute({ ministryId });
  if (!getResult.ok) {
    return NextResponse.json(getResult, { status: 404 });
  }

  const ministry = getResult.value.ministry;

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (c) => c.churchId === ministry.churchId,
    );
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para excluir ministérios desta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await ministryContainer.deleteMinistry.execute({ ministryId });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 204 : getHttpStatus(errorCode),
  });
}
