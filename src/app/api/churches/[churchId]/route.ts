import { type NextRequest, NextResponse } from "next/server";
import { CreateChurchInputSchema } from "@/application/dtos/church/CreateChurchDTO";
import { Permission } from "@/domain/enums/Permission";
import { churchContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import {
  canAccessChurch,
  hasAnyPermission,
  validateSession,
} from "../../_lib/auth";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { churchId } = await params;

  const canReadChurch =
    canAccessChurch(user, churchId) &&
    hasAnyPermission(user, [
      Permission.CHURCH_READ,
      Permission.CHURCH_SELF_READ,
    ]);

  if (!canReadChurch) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar esta igreja",
        },
      },
      { status: 403 },
    );
  }

  const result = await churchContainer.getChurch.execute({ churchId });

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
  const { churchId } = await params;

  const canWriteChurch =
    canAccessChurch(user, churchId) &&
    hasAnyPermission(user, [
      Permission.CHURCH_WRITE,
      Permission.CHURCH_SELF_WRITE,
    ]);

  if (!canWriteChurch) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para editar esta igreja",
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

  const parsed = CreateChurchInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await churchContainer.updateChurch.execute({
    churchId,
    name: parsed.data.name,
    selfSignupDefaultRoleId: parsed.data.selfSignupDefaultRoleId,
    updatedByUserId: auth.user.userId,
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
  const { churchId } = await params;

  const canDeleteChurch =
    canAccessChurch(user, churchId) &&
    hasAnyPermission(user, [Permission.CHURCH_DELETE]);

  if (!canDeleteChurch) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para excluir esta igreja",
        },
      },
      { status: 403 },
    );
  }

  const result = await churchContainer.deleteChurch.execute({ churchId });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return new NextResponse(null, { status: 204 });
}
