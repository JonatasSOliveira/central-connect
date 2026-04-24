import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getChurchIdFromSession, validateSession } from "../../_lib/auth";

const GenerateScaleInputSchema = z.object({
  serviceId: z.string().min(1, "Culto é obrigatório"),
  ministryId: z.string().min(1, "Ministério é obrigatório"),
});

export async function POST(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const canGenerateScale =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_WRITE);

  if (!canGenerateScale) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para gerar escalas",
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

  const parsed = GenerateScaleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const churchId = getChurchIdFromSession(user, null);

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

  const result = await scaleContainer.createScale.execute({
    churchId,
    serviceId: parsed.data.serviceId,
    ministryId: parsed.data.ministryId,
    status: "draft",
    notes: null,
    members: [],
    autoAssignMembers: true,
    createdByUserId: user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
