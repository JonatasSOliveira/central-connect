import { type NextRequest, NextResponse } from "next/server";
import { NotifyScalesByDateSchema } from "@/application/dtos/notification/NotifyScalesByDateDTO";
import { Permission } from "@/domain/enums/Permission";
import { notificationContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { getChurchIdFromSession, validateSession } from "../../_lib/auth";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const canNotifyScales =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_WRITE);

  if (!canNotifyScales) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para notificar escalas",
        },
      },
      { status: 403 },
    );
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

  const parsed = NotifyScalesByDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await notificationContainer.notifyPublishedScalesByDate.execute({
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
    errorCode: result.ok ? null : errorCode ?? null,
    details: result.ok
      ? {
          date: result.value.date,
          serviceCount: result.value.serviceCount,
          scaleCount: result.value.scaleCount,
          targetedMembers: result.value.targetedMembers,
          successCount: result.value.successCount,
          failureCount: result.value.failureCount,
        }
      : { date: parsed.data.date },
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
