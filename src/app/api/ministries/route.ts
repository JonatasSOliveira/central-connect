import { type NextRequest, NextResponse } from "next/server";
import { MinistryFormSchema } from "@/application/dtos/ministry/MinistryDTO";
import { Permission } from "@/domain/enums/Permission";
import { ministryContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const churchId = searchParams.get("churchId");

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

  const churchIdToUse = user.isSuperAdmin
    ? churchId || undefined
    : churchId || user.churchId || user.churches[0]?.churchId;

  if (!user.isSuperAdmin && !churchIdToUse) {
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

  if (churchId && !user.isSuperAdmin) {
    const hasAccess = user.churches.some((c) => c.churchId === churchId);
    if (!hasAccess) {
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
    churchId: churchIdToUse,
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
    const hasAccess = user.churches.some(
      (c) => c.churchId === parsed.data.churchId,
    );
    if (!hasAccess) {
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
    churchId: parsed.data.churchId,
    name: parsed.data.name,
    leaderId: parsed.data.leaderId,
    minMembersPerService: parsed.data.minMembersPerService,
    idealMembersPerService: parsed.data.idealMembersPerService,
    notes: parsed.data.notes,
    roles: parsed.data.roles,
    createdByUserId: user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
