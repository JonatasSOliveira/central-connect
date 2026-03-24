import { type NextRequest, NextResponse } from "next/server";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { Permission } from "@/domain/enums/Permission";
import { ministryContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

function buildUserChurches(
  isSuperAdmin: boolean,
  userChurches: { churchId: string; roleId: string | null }[],
  permissions: string[],
): { churchId: string; hasRead: boolean; hasWrite: boolean }[] {
  if (isSuperAdmin) {
    return userChurches.map((c) => ({
      churchId: c.churchId,
      hasRead: true,
      hasWrite: true,
    }));
  }

  return userChurches.map((c) => ({
    churchId: c.churchId,
    hasRead: permissions.includes(Permission.MINISTRY_READ),
    hasWrite: permissions.includes(Permission.MINISTRY_WRITE),
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

  const userChurches = buildUserChurches(
    user.isSuperAdmin,
    user.churches,
    user.permissions,
  );

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

  if (churchId) {
    const churchAccess = userChurches.find((c) => c.churchId === churchId);
    if (!churchAccess?.hasRead && !user.isSuperAdmin) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para acessar esta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await ministryContainer.listMinistries.execute({
    churchId: churchId || user.churches[0]?.churchId,
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

  const canCreateMinistry =
    user.isSuperAdmin || user.permissions.includes(Permission.MINISTRY_WRITE);

  if (!canCreateMinistry) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para criar ministérios",
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

  const parsed = MinistryFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  if (!user.isSuperAdmin) {
    const userWritableChurchIds = user.churches
      .filter((c) => user.permissions.includes(Permission.MINISTRY_WRITE))
      .map((c) => c.churchId);

    if (!userWritableChurchIds.includes(parsed.data.churchId)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para criar ministérios nesta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await ministryContainer.createMinistry.execute({
    ...parsed.data,
    createdByUserId: user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
