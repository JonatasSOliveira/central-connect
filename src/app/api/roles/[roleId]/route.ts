import { type NextRequest, NextResponse } from "next/server";
import { UpdateRoleInputSchema } from "@/application/dtos/role/UpdateRoleDTO";
import { Permission } from "@/domain/enums/Permission";
import { roleContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { hasPermission, validateSession } from "../../_lib/auth";

interface RouteParams {
  params: Promise<{ roleId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  if (!hasPermission(auth.user, Permission.ROLE_READ)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar este cargo",
        },
      },
      { status: 403 },
    );
  }

  const { roleId } = await params;
  const result = await roleContainer.getRole.execute({ roleId });

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

  if (!hasPermission(user, Permission.ROLE_WRITE)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para editar este cargo do sistema",
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

  const parsed = UpdateRoleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const { roleId } = await params;
  const result = await roleContainer.updateRole.execute({
    roleId,
    ...parsed.data,
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
  const { roleId } = await params;

  const canDeleteRole = hasPermission(user, Permission.ROLE_DELETE);

  if (!canDeleteRole) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir este cargo do sistema",
        },
      },
      { status: 403 },
    );
  }

  const result = await roleContainer.deleteRole.execute({ roleId });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return new NextResponse(null, { status: 204 });
}
