import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession, validateSession } from "@/app/api/_lib/auth";
import { ListScaleAttendancesQuerySchema } from "@/modules/scales/application/dtos/ListScaleAttendancesDTO";
import { SaveScaleAttendanceSchema } from "@/modules/scales/application/dtos/ScaleAttendanceDTO";
import type { ScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError } from "@/shared/utils/apiResponse";

function statusByError(code?: string): number {
  switch (code) {
    case "SCALE_NOT_FOUND":
      return 404;
    case "SCALE_MEMBER_NOT_IN_SCALE":
    case "INVALID_ATTENDANCE_JUSTIFICATION":
    case "VALIDATION_ERROR":
      return 400;
    case "ATTENDANCE_ALREADY_PUBLISHED":
      return 409;
    default:
      return 500;
  }
}

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
}

async function parseJson(
  request: NextRequest,
): Promise<unknown | NextResponse> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), { status: 400 });
  }
  try {
    return await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
  }
}

async function getAttendance(
  _request: NextRequest,
  scaleId: string,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  const canRead =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_READ) ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_REPORT_READ) ||
    user.permissions.includes(Permission.SCALE_READ);
  if (!canRead)
    return unauthorized("Sem permissão para visualizar chamada da escala");
  const result = await dependencies.scale.getScaleAttendance.execute({
    scaleId,
  });
  if (!result.ok)
    return NextResponse.json(result, {
      status: statusByError(result.error?.code),
    });
  if (
    !user.isSuperAdmin &&
    !user.churches.some(
      (church) => church.churchId === result.value.attendance.churchId,
    )
  )
    return unauthorized("Sem permissão para visualizar chamada desta igreja");
  return NextResponse.json(result, { status: 200 });
}

async function saveAttendance(
  request: NextRequest,
  scaleId: string,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  const canWriteDraft =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_DRAFT) ||
    user.permissions.includes(Permission.SCALE_WRITE);
  const canWriteAnytime =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_ANYTIME);
  if (!canWriteDraft && !canWriteAnytime)
    return unauthorized("Sem permissão para alterar chamada da escala");
  const current = await dependencies.scale.getScaleAttendance.execute({
    scaleId,
  });
  if (!current.ok)
    return NextResponse.json(current, {
      status: statusByError(current.error?.code),
    });
  if (
    !user.isSuperAdmin &&
    !user.churches.some(
      (church) => church.churchId === current.value.attendance.churchId,
    )
  )
    return unauthorized("Sem permissão para alterar chamada desta igreja");
  const body = await parseJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = SaveScaleAttendanceSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result = await dependencies.scale.saveScaleAttendance.execute({
    scaleId,
    entries: parsed.data.entries,
    checkedByUserId: user.userId,
    allowPublishedEdit: canWriteAnytime,
  });
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByError(result.error?.code),
  });
}

async function publishAttendance(
  _request: NextRequest,
  scaleId: string,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  const canPublish =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_PUBLISH) ||
    user.permissions.includes(Permission.SCALE_WRITE);
  if (!canPublish)
    return unauthorized("Sem permissão para publicar chamada da escala");
  const attendance = await dependencies.scale.getScaleAttendance.execute({
    scaleId,
  });
  if (!attendance.ok)
    return NextResponse.json(attendance, {
      status: statusByError(attendance.error?.code),
    });
  if (
    !user.isSuperAdmin &&
    !user.churches.some(
      (church) => church.churchId === attendance.value.attendance.churchId,
    )
  )
    return unauthorized("Sem permissão para publicar chamada desta igreja");
  const result = await dependencies.scale.publishScaleAttendance.execute({
    scaleId,
    publishedByUserId: user.userId,
  });
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByError(result.error?.code),
  });
}

async function listAttendances(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (
    !user.isSuperAdmin &&
    !user.permissions.includes(Permission.SCALE_ATTENDANCE_READ)
  )
    return unauthorized("Sem permissão para visualizar chamadas");
  const params = new URL(request.url).searchParams;
  const churchId = getChurchIdFromSession(user, params.get("churchId"));
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
  if (
    !user.isSuperAdmin &&
    !user.churches.some((church) => church.churchId === churchId)
  )
    return unauthorized("Sem permissão para acessar esta igreja");
  const parsed = ListScaleAttendancesQuerySchema.safeParse({
    churchId,
    filter: params.get("filter") ?? "today",
  });
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  const result = await dependencies.scale.listScaleAttendances.execute(
    parsed.data,
  );
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByError(result.error?.code),
  });
}

export function createScaleAttendanceHandlers(
  dependencies: ScalesInfrastructure,
) {
  return {
    get: (request: NextRequest, scaleId: string) =>
      getAttendance(request, scaleId, dependencies),
    save: (request: NextRequest, scaleId: string) =>
      saveAttendance(request, scaleId, dependencies),
    publish: (request: NextRequest, scaleId: string) =>
      publishAttendance(request, scaleId, dependencies),
    list: (request: NextRequest) => listAttendances(request, dependencies),
  };
}
