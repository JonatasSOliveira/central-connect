import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { serviceContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getChurchIdFromSession, validateSession } from "../../_lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { serviceId } = await params;
  const { searchParams } = new URL(request.url);
  const queryChurchId = searchParams.get("churchId");
  const churchId = getChurchIdFromSession(user, queryChurchId);

  if (!churchId) {
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
  }

  const canAccess =
    user.isSuperAdmin || user.churches.some((c) => c.churchId === churchId);

  if (!canAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para acessar cultos desta igreja",
        },
      },
      { status: 403 },
    );
  }

  const result = await serviceContainer.getService.execute({
    serviceId,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canUpdate =
    user.isSuperAdmin || user.permissions.includes(Permission.SERVICE_WRITE);

  if (!canUpdate) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para editar cultos",
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

  const { serviceId } = await params;
  const { searchParams } = new URL(request.url);
  const queryChurchId = searchParams.get("churchId");
  const churchId = getChurchIdFromSession(user, queryChurchId);

  if (!churchId) {
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
  }

  const { UpdateServiceInputSchema } = await import(
    "@/application/dtos/service/UpdateServiceDTO"
  );
  const parsed = UpdateServiceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await serviceContainer.updateService.execute({
    ...parsed.data,
    serviceId,
    churchId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canDelete =
    user.isSuperAdmin || user.permissions.includes(Permission.SERVICE_DELETE);

  if (!canDelete) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir cultos",
        },
      },
      { status: 403 },
    );
  }

  const { serviceId } = await params;
  const { searchParams } = new URL(request.url);
  const queryChurchId = searchParams.get("churchId");
  const churchId = getChurchIdFromSession(user, queryChurchId);

  if (!churchId) {
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
  }

  const result = await serviceContainer.deleteService.execute({
    serviceId,
    churchId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
