import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { validateSession } from "../../../../_lib/auth";

function getStatusByErrorCode(code?: string): number {
  switch (code) {
    case "SCALE_NOT_FOUND":
      return 404;
    default:
      return 500;
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const canPublish =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_PUBLISH) ||
    user.permissions.includes(Permission.SCALE_WRITE);

  if (!canPublish) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para publicar chamada da escala",
        },
      },
      { status: 403 },
    );
  }

  const attendanceResult = await scaleContainer.getScaleAttendance.execute({
    scaleId,
  });

  if (!attendanceResult.ok) {
    return NextResponse.json(attendanceResult, {
      status: getStatusByErrorCode(attendanceResult.error?.code),
    });
  }

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (church) =>
        church.churchId === attendanceResult.value.attendance.churchId,
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para publicar chamada desta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  const result = await scaleContainer.publishScaleAttendance.execute({
    scaleId,
    publishedByUserId: user.userId,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : getStatusByErrorCode(result.error?.code),
  });
}
