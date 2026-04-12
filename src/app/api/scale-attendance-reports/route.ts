import { type NextRequest, NextResponse } from "next/server";
import { ScaleAttendanceReportQuerySchema } from "@/application/dtos/scale/ScaleAttendanceReportDTO";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { apiError } from "@/shared/utils/apiResponse";
import { getChurchIdFromSession, validateSession } from "../_lib/auth";

function getStatusByErrorCode(code?: string): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_AUTHORIZED":
      return 403;
    default:
      return 500;
  }
}

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const canReadReport =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_REPORT_READ);

  if (!canReadReport) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar relatório de escalas",
        },
      },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const churchId = getChurchIdFromSession(user, searchParams.get("churchId"));
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const ministryId = searchParams.get("ministryId") ?? undefined;

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
    const hasAccess = user.churches.some(
      (church) => church.churchId === churchId,
    );
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

  const parsed = ScaleAttendanceReportQuerySchema.safeParse({
    churchId,
    startDate,
    endDate,
    ministryId,
  });

  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await scaleContainer.getScaleAttendanceReport.execute(
    parsed.data,
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : getStatusByErrorCode(result.error?.code),
  });
}
