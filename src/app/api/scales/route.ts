import { type NextRequest, NextResponse } from "next/server";
import { ScaleFormSchema } from "@/application/dtos/scale/ScaleDTO";
import { Permission } from "@/domain/enums/Permission";
import { notificationContainer, scaleContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { getChurchIdFromSession, validateSession } from "../_lib/auth";

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { searchParams } = new URL(request.url);
  const queryChurchId = searchParams.get("churchId");
  const churchId = getChurchIdFromSession(user, queryChurchId);

  const hasReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_READ);
  const hasSelfReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_SELF_READ);

  if (!hasReadAccess && !hasSelfReadAccess) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar escalas",
        },
      },
      { status: 403 },
    );
  }

  if (!churchId && !user.isSuperAdmin) {
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

  if (queryChurchId && !user.isSuperAdmin) {
    const hasAccess = user.churches.some((c) => c.churchId === queryChurchId);
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

  const serviceId = searchParams.get("serviceId") || undefined;
  const ministryId = searchParams.get("ministryId") || undefined;

  const result = await scaleContainer.listScales.execute({
    churchId: churchId || "",
    serviceId,
    ministryId,
  });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  if (!hasReadAccess && hasSelfReadAccess && !user.isSuperAdmin) {
    const scaleIds = result.value.scales.map((scale) => scale.id);

    if (scaleIds.length === 0) {
      return NextResponse.json(result, { status: 200 });
    }

    const scaleMembers =
      await scaleContainer.scaleMemberRepository.findByScaleIds(scaleIds);

    const allowedScaleIds = new Set(
      scaleMembers
        .filter((member) => member.memberId === user.memberId)
        .map((member) => member.scaleId),
    );

    const filteredScales = result.value.scales.filter(
      (scale) =>
        allowedScaleIds.has(scale.id) &&
        scale.status === "published",
    );

    return NextResponse.json(
      {
        ok: true,
        value: {
          scales: filteredScales,
        },
      },
      { status: 200 },
    );
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const canCreateScale =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_WRITE);

  if (!canCreateScale) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para criar escalas",
        },
      },
      { status: 403 },
    );
  }

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

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some((c) => c.churchId === churchId);
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para criar escalas nesta igreja",
          },
        },
        { status: 403 },
      );
    }
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

  const parsed = ScaleFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await scaleContainer.createScale.execute({
    churchId,
    serviceId: parsed.data.serviceId,
    ministryId: parsed.data.ministryId,
    status: parsed.data.status,
    notes: parsed.data.notes,
    members: parsed.data.members.map((m) => ({
      memberId: m.memberId,
      ministryRoleId: m.ministryRoleId,
      notes: m.notes ?? null,
    })),
    createdByUserId: user.userId,
  });

  if (result.ok && result.value.scale.status === "published") {
    const targetMemberIds = Array.from(
      new Set(result.value.scale.members.map((member) => member.memberId)),
    );

    if (targetMemberIds.length > 0) {
      try {
        await notificationContainer.notifyScaleMembers.execute({
          churchId,
          scaleId: result.value.scale.id,
          serviceId: result.value.scale.serviceId,
          memberIds: targetMemberIds,
          trigger: "scale_published",
        });
      } catch {
        logEvent("warn", {
          event: "scale_publish_push_failed",
          requestId,
          route: "/api/scales",
          status: 201,
          userId: user.userId,
          churchId,
          details: {
            scaleId: result.value.scale.id,
            targetCount: targetMemberIds.length,
          },
        });

        // noop: não bloqueia criação da escala por falha de push
      }
    }
  }

  const errorCode = "error" in result ? result.error?.code : undefined;

  logEvent(result.ok ? "info" : "warn", {
    event: result.ok ? "scale_create_success" : "scale_create_failed",
    requestId,
    route: "/api/scales",
    status: result.ok ? 201 : getHttpStatus(errorCode),
    userId: user.userId,
    churchId,
    errorCode: result.ok ? null : errorCode ?? null,
    details: result.ok ? { scaleId: result.value.scale.id } : undefined,
  });

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
