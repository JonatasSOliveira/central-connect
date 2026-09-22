import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession, validateSession } from "@/app/api/_lib/auth";
import { ScaleFormSchema } from "@/modules/scales/application/dtos/ScaleDTO";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";

interface ScaleResult {
  ok: boolean;
  value?: {
    scale?: {
      id: string;
      churchId: string;
      serviceId: string;
      status: string;
      members: Array<{ memberId: string }>;
    };
    scales?: Array<{
      id: string;
      churchId: string;
      status: string;
    }>;
  };
  error?: { code?: string };
}

interface DeleteResult {
  ok: boolean;
  error?: { code?: string };
}

type ScaleData = NonNullable<NonNullable<ScaleResult["value"]>["scale"]>;

export interface ScaleHandlerDependencies {
  scale: {
    listScales: { execute(input: unknown): Promise<ScaleResult> };
    createScale: { execute(input: unknown): Promise<ScaleResult> };
    getScale: { execute(input: unknown): Promise<ScaleResult> };
    updateScale: { execute(input: unknown): Promise<ScaleResult> };
    deleteScale: { execute(input: unknown): Promise<DeleteResult> };
    scaleMemberRepository: {
      findByScaleId(scaleId: string): Promise<Array<{ memberId: string }>>;
      findByScaleIds(
        scaleIds: string[],
      ): Promise<Array<{ scaleId: string; memberId: string }>>;
    };
  };
  notification: {
    notifyScaleMembers: { execute(input: unknown): Promise<unknown> };
  };
}

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
}

function invalidChurch(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NO_CHURCH_SELECTED", message } },
    { status: 400 },
  );
}

function resultStatus(result: ScaleResult, successStatus: number): number {
  return result.ok ? successStatus : getHttpStatus(result.error?.code);
}

async function readJson(request: NextRequest): Promise<unknown | NextResponse> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), { status: 400 });
  }

  try {
    return await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
  }
}

export function createScaleHandlers(dependencies: ScaleHandlerDependencies) {
  return {
    collection: async (request: NextRequest) => {
      if (request.method === "GET") {
        return listScales(request, dependencies);
      }
      return createScale(request, dependencies);
    },
    item: async (request: NextRequest, scaleId: string) => {
      if (request.method === "GET")
        return getScale(request, scaleId, dependencies);
      if (request.method === "PUT")
        return updateScale(request, scaleId, dependencies);
      return deleteScale(request, scaleId, dependencies);
    },
  };
}

async function listScales(
  request: NextRequest,
  dependencies: ScaleHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });

  const { user } = auth;
  const params = new URL(request.url).searchParams;
  const queryChurchId = params.get("churchId");
  const churchId = getChurchIdFromSession(user, queryChurchId);
  const hasReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_READ);
  const hasSelfReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_SELF_READ);

  if (!hasReadAccess && !hasSelfReadAccess)
    return unauthorized("Sem permissão para visualizar escalas");
  if (!churchId && !user.isSuperAdmin)
    return invalidChurch("Nenhuma igreja selecionada");
  if (
    queryChurchId &&
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === queryChurchId)
  ) {
    return unauthorized("Sem permissão para acessar esta igreja");
  }

  const result = await dependencies.scale.listScales.execute({
    churchId: churchId || "",
    serviceId: params.get("serviceId") || undefined,
    ministryId: params.get("ministryId") || undefined,
  });
  if (!result.ok)
    return NextResponse.json(result, { status: resultStatus(result, 200) });
  if (!hasReadAccess && hasSelfReadAccess && !user.isSuperAdmin) {
    const scales = result.value?.scales ?? [];
    const scaleIds = scales.map((scale) => scale.id);
    if (scaleIds.length === 0)
      return NextResponse.json(result, { status: 200 });
    const members =
      await dependencies.scale.scaleMemberRepository.findByScaleIds(scaleIds);
    const allowedIds = new Set(
      members
        .filter((member) => member.memberId === user.memberId)
        .map((member) => member.scaleId),
    );
    return NextResponse.json(
      {
        ok: true,
        value: {
          scales: scales.filter(
            (scale) => allowedIds.has(scale.id) && scale.status === "published",
          ),
        },
      },
      { status: 200 },
    );
  }
  return NextResponse.json(result, { status: 200 });
}

async function createScale(
  request: NextRequest,
  dependencies: ScaleHandlerDependencies,
) {
  const requestId = getRequestId(request);
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (!user.isSuperAdmin && !user.permissions.includes(Permission.SCALE_WRITE))
    return unauthorized("Sem permissão para criar escalas");
  const params = new URL(request.url).searchParams;
  const churchId = getChurchIdFromSession(user, params.get("churchId"));
  if (!churchId) return invalidChurch("Nenhuma igreja selecionada");
  if (
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === churchId)
  )
    return unauthorized("Sem permissão para criar escalas nesta igreja");
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = ScaleFormSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result = await dependencies.scale.createScale.execute({
    churchId,
    serviceId: parsed.data.serviceId,
    ministryId: parsed.data.ministryId,
    status: parsed.data.status,
    notes: parsed.data.notes,
    members: parsed.data.members.map((member) => ({
      memberId: member.memberId,
      ministryRoleId: member.ministryRoleId,
      notes: member.notes ?? null,
    })),
    createdByUserId: user.userId,
  });
  const createdScale = result.value?.scale;
  if (result.ok && createdScale?.status === "published")
    await notifyPublishedScale(
      createdScale,
      churchId,
      dependencies,
      requestId,
      user.userId,
    );
  logEvent(result.ok ? "info" : "warn", {
    event: result.ok ? "scale_create_success" : "scale_create_failed",
    requestId,
    route: "/api/scales",
    status: resultStatus(result, 201),
    userId: user.userId,
    churchId,
  });
  return NextResponse.json(result, { status: resultStatus(result, 201) });
}

async function getScale(
  _request: NextRequest,
  scaleId: string,
  dependencies: ScaleHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  const hasReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_READ);
  const hasSelfReadAccess =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_SELF_READ);
  if (!hasReadAccess && !hasSelfReadAccess)
    return unauthorized("Sem permissão para visualizar escalas");
  const result = await dependencies.scale.getScale.execute({ scaleId });
  if (!result.ok)
    return NextResponse.json(result, { status: resultStatus(result, 200) });
  const scale = result.value?.scale;
  if (!scale) return NextResponse.json(result, { status: 200 });
  if (!hasReadAccess && hasSelfReadAccess && !user.isSuperAdmin) {
    const members =
      await dependencies.scale.scaleMemberRepository.findByScaleId(scaleId);
    if (
      !members.some((member) => member.memberId === user.memberId) ||
      scale.status !== "published"
    )
      return unauthorized("Sem permissão para visualizar esta escala");
  }
  if (
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === scale.churchId)
  )
    return unauthorized("Sem permissão para visualizar esta escala");
  return NextResponse.json(result, { status: 200 });
}

async function updateScale(
  request: NextRequest,
  scaleId: string,
  dependencies: ScaleHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (!user.isSuperAdmin && !user.permissions.includes(Permission.SCALE_WRITE))
    return unauthorized("Sem permissão para atualizar escalas");
  const current = await dependencies.scale.getScale.execute({ scaleId });
  if (!current.ok) return NextResponse.json(current, { status: 404 });
  const existing = current.value?.scale;
  if (!existing) return NextResponse.json(current, { status: 404 });
  if (
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === existing.churchId)
  )
    return unauthorized("Sem permissão para atualizar esta escala");
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = ScaleFormSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result = await dependencies.scale.updateScale.execute({
    scaleId,
    churchId: existing.churchId,
    serviceId: parsed.data.serviceId,
    ministryId: parsed.data.ministryId,
    status: parsed.data.status,
    notes: parsed.data.notes,
    members: parsed.data.members.map((member) => ({
      id: member.id ?? null,
      memberId: member.memberId,
      ministryRoleId: member.ministryRoleId,
      notes: member.notes ?? null,
    })),
    updatedByUserId: user.userId,
  });
  const updatedScale = result.value?.scale;
  if (
    result.ok &&
    existing.status === "draft" &&
    updatedScale?.status === "published"
  )
    await notifyPublishedScale(
      updatedScale,
      existing.churchId,
      dependencies,
      getRequestId(request),
      user.userId,
    );
  return NextResponse.json(result, { status: resultStatus(result, 200) });
}

async function deleteScale(
  _request: NextRequest,
  scaleId: string,
  dependencies: ScaleHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (!user.isSuperAdmin && !user.permissions.includes(Permission.SCALE_DELETE))
    return unauthorized("Sem permissão para excluir escalas");
  const current = await dependencies.scale.getScale.execute({ scaleId });
  if (!current.ok) return NextResponse.json(current, { status: 404 });
  const scale = current.value?.scale;
  if (!scale) return NextResponse.json(current, { status: 404 });
  if (
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === scale.churchId)
  )
    return unauthorized("Sem permissão para excluir esta escala");
  const result = await dependencies.scale.deleteScale.execute({ scaleId });
  return NextResponse.json(result, { status: resultStatus(result, 204) });
}

async function notifyPublishedScale(
  scale: ScaleData,
  churchId: string,
  dependencies: ScaleHandlerDependencies,
  requestId: string,
  userId: string,
) {
  const memberIds = Array.from(
    new Set(scale.members.map((member) => member.memberId)),
  );
  if (memberIds.length === 0) return;
  try {
    await dependencies.notification.notifyScaleMembers.execute({
      churchId,
      scaleId: scale.id,
      serviceId: scale.serviceId,
      memberIds,
      trigger: "scale_published",
    });
  } catch {
    logEvent("warn", {
      event: "scale_publish_push_failed",
      route: "/api/scales",
      requestId,
      status: 201,
      userId,
      churchId,
      details: { scaleId: scale.id, targetCount: memberIds.length },
    });
  }
}
