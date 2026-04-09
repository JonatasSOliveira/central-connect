import { type NextRequest, NextResponse } from "next/server";
import { ScaleFormSchema } from "@/application/dtos/scale/ScaleDTO";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../../_lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const hasReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_READ);

  if (!hasReadAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar escalas",
        },
      },
      { status: 403 },
    );
  }

  const getResult = await scaleContainer.getScale.execute({ scaleId });

  if (!getResult.ok) {
    const errorCode = getResult.error?.code;
    return NextResponse.json(getResult, {
      status: getHttpStatus(errorCode),
    });
  }

  const scale = getResult.value.scale;

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some((c) => c.churchId === scale.churchId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para visualizar esta escala",
          },
        },
        { status: 403 },
      );
    }
  }

  return NextResponse.json(getResult, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const canUpdateScale =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_WRITE);

  if (!canUpdateScale) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para atualizar escalas",
        },
      },
      { status: 403 },
    );
  }

  const getResult = await scaleContainer.getScale.execute({ scaleId });
  if (!getResult.ok) {
    return NextResponse.json(getResult, { status: 404 });
  }

  const existingScale = getResult.value.scale;

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (c) => c.churchId === existingScale.churchId,
    );
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para atualizar esta escala",
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

  const parsed = ScaleFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await scaleContainer.updateScale.execute({
    scaleId,
    churchId: existingScale.churchId,
    serviceId: parsed.data.serviceId,
    ministryId: parsed.data.ministryId,
    status: parsed.data.status,
    notes: parsed.data.notes,
    members: parsed.data.members.map((m) => ({
      id: m.id ?? null,
      memberId: m.memberId,
      ministryRoleId: m.ministryRoleId,
      notes: m.notes ?? null,
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
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const canDeleteScale =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_DELETE);

  if (!canDeleteScale) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir escalas",
        },
      },
      { status: 403 },
    );
  }

  const getResult = await scaleContainer.getScale.execute({ scaleId });
  if (!getResult.ok) {
    return NextResponse.json(getResult, { status: 404 });
  }

  const scale = getResult.value.scale;

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some((c) => c.churchId === scale.churchId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para excluir esta escala",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await scaleContainer.deleteScale.execute({ scaleId });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 204 : getHttpStatus(errorCode),
  });
}
