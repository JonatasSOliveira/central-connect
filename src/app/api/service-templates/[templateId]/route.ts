import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { serviceContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../../_lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canUpdate =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SERVICE_TEMPLATE_WRITE);

  if (!canUpdate) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para editar templates",
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

  const { templateId } = await params;
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

  const { UpdateServiceTemplateInputSchema } = await import(
    "@/application/dtos/serviceTemplate/UpdateServiceTemplateDTO"
  );
  const parsed = UpdateServiceTemplateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await serviceContainer.updateServiceTemplate.execute({
    ...parsed.data,
    templateId,
    churchId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canDelete =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SERVICE_TEMPLATE_DELETE);

  if (!canDelete) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir templates",
        },
      },
      { status: 403 },
    );
  }

  const { templateId } = await params;
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

  const result = await serviceContainer.deleteServiceTemplate.execute({
    templateId,
    churchId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
