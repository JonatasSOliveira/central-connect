import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession, validateSession } from "@/app/api/_lib/auth";
import { ScaleAttendanceReportQuerySchema } from "@/modules/scales/application/dtos/ScaleAttendanceReportDTO";
import type { ScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError } from "@/shared/utils/apiResponse";

function statusByError(code?: string): number {
  if (code === "VALIDATION_ERROR") return 400;
  if (code === "NOT_AUTHORIZED") return 403;
  return 500;
}

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
}

async function getReport(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (
    !user.isSuperAdmin &&
    !user.permissions.includes(Permission.SCALE_ATTENDANCE_REPORT_READ)
  )
    return unauthorized("Sem permissão para visualizar relatório de escalas");

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

  const parsed = ScaleAttendanceReportQuerySchema.safeParse({
    churchId,
    startDate: params.get("startDate"),
    endDate: params.get("endDate"),
    ministryId: params.get("ministryId") ?? undefined,
  });
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });

  const result = await dependencies.scale.getScaleAttendanceReport.execute(
    parsed.data,
  );
  return NextResponse.json(result, {
    status: result.ok ? 200 : statusByError(result.error?.code),
  });
}

async function listReportMinistries(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  if (
    !user.isSuperAdmin &&
    !user.permissions.includes(Permission.SCALE_ATTENDANCE_REPORT_READ)
  )
    return unauthorized("Sem permissão para visualizar relatório de escalas");
  const churchId = getChurchIdFromSession(
    user,
    new URL(request.url).searchParams.get("churchId"),
  );
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

  const result = await dependencies.ministries.listMinistries.execute({
    churchId,
  });
  if (!result.ok) return NextResponse.json(result, { status: 500 });
  return NextResponse.json(
    {
      ok: true,
      value: {
        ministries: result.value.ministries.map((ministry) => ({
          id: ministry.id,
          name: ministry.name,
        })),
      },
    },
    { status: 200 },
  );
}

export function createScaleReportHandlers(dependencies: ScalesInfrastructure) {
  return {
    get: (request: NextRequest) => getReport(request, dependencies),
    ministries: (request: NextRequest) =>
      listReportMinistries(request, dependencies),
  };
}
