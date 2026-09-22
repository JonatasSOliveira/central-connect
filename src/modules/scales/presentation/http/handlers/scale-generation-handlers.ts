import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChurchIdFromSession, validateSession } from "@/app/api/_lib/auth";
import { NotifyScalesByDateSchema } from "@/modules/notifications/application/dtos/NotifyScalesByDateDTO";
import type { ScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";

const GenerateScaleInputSchema = z.object({
  serviceId: z.string().min(1, "Culto é obrigatório"),
  ministryId: z.string().min(1, "Ministério é obrigatório"),
});

const ScheduledRunSchema = z.object({
  churchIds: z.array(z.string().min(1)).max(500).optional(),
  lookaheadDays: z.number().int().min(1).max(31).default(7),
});

const INTERNAL_API_KEY_HEADER = "x-internal-api-key";

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
}

async function readJson(request: NextRequest): Promise<unknown | NextResponse> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), { status: 400 });
  try {
    return await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
  }
}

async function generateScale(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (!user.isSuperAdmin && !user.permissions.includes(Permission.SCALE_WRITE))
    return unauthorized("Sem permissão para gerar escalas");

  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = GenerateScaleInputSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });

  const churchId = getChurchIdFromSession(user, null);
  if (!churchId)
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

  const result = await dependencies.scale.createScale.execute({
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

async function runScheduledGeneration(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (!expectedKey)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Chave de API interna não configurada",
        },
      },
      { status: 500 },
    );
  if (request.headers.get(INTERNAL_API_KEY_HEADER) !== expectedKey)
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Acesso não autorizado" },
      },
      { status: 401 },
    );

  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = ScheduledRunSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result = await dependencies.scale.runScheduledScaleGeneration.execute(
    parsed.data,
  );
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

async function notifyByDate(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const requestId = getRequestId(request);
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (!user.isSuperAdmin && !user.permissions.includes(Permission.SCALE_WRITE))
    return unauthorized("Sem permissão para notificar escalas");
  const churchId = getChurchIdFromSession(user, null);
  if (!churchId)
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
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = NotifyScalesByDateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result =
    await dependencies.notification.notifyPublishedScalesByDate.execute({
      churchId,
      date: parsed.data.date,
    });
  const errorCode = "error" in result ? result.error?.code : undefined;
  logEvent(result.ok ? "info" : "warn", {
    event: result.ok
      ? "scale_notify_by_date_success"
      : "scale_notify_by_date_failed",
    requestId,
    route: "/api/scales/notify-by-date",
    status: result.ok ? 200 : getHttpStatus(errorCode),
    userId: user.userId,
    churchId,
    errorCode: result.ok ? null : (errorCode ?? null),
    details: result.ok ? result.value : { date: parsed.data.date },
  });
  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export function createScaleGenerationHandlers(
  dependencies: ScalesInfrastructure,
) {
  return {
    generate: (request: NextRequest) => generateScale(request, dependencies),
    scheduledRun: (request: NextRequest) =>
      runScheduledGeneration(request, dependencies),
    notifyByDate: (request: NextRequest) => notifyByDate(request, dependencies),
  };
}
