import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { serviceContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../../_lib/auth";

export async function POST(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canGenerate =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SERVICE_TEMPLATE_GENERATE);

  if (!canGenerate) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para gerar cultos da semana",
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

  const { GenerateWeekInputSchema } = await import(
    "@/application/dtos/serviceTemplate/GenerateWeekDTO"
  );
  const parsed = GenerateWeekInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const { churchId, weekStartDate } = parsed.data;

  if (!user.isSuperAdmin) {
    const userWritableChurchIds = user.churches.map((c) => c.churchId);
    if (!userWritableChurchIds.includes(churchId)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para gerar cultos nesta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await serviceContainer.generateWeekServices.execute({
    churchId,
    weekStartDate,
    generatedByUserId: user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
