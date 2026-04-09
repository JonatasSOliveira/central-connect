import { type NextRequest, NextResponse } from "next/server";
import { SaveScaleAttendanceSchema } from "@/application/dtos/scale/ScaleAttendanceDTO";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { apiError } from "@/shared/utils/apiResponse";
import { validateSession } from "../../../_lib/auth";

function getStatusByErrorCode(code?: string): number {
  switch (code) {
    case "SCALE_NOT_FOUND":
      return 404;
    case "SCALE_MEMBER_NOT_IN_SCALE":
    case "INVALID_ATTENDANCE_JUSTIFICATION":
      return 400;
    case "ATTENDANCE_ALREADY_PUBLISHED":
      return 409;
    default:
      return 500;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const canReadAttendance =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_READ) ||
    user.permissions.includes(Permission.SCALE_READ);

  if (!canReadAttendance) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar chamada da escala",
        },
      },
      { status: 403 },
    );
  }

  const result = await scaleContainer.getScaleAttendance.execute({ scaleId });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: getStatusByErrorCode(result.error?.code),
    });
  }

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (church) => church.churchId === result.value.attendance.churchId,
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para visualizar chamada desta igreja",
          },
        },
        { status: 403 },
      );
    }
  }

  return NextResponse.json(result, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ scaleId: string }> },
) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { scaleId } = await params;

  const canWriteDraft =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_DRAFT) ||
    user.permissions.includes(Permission.SCALE_WRITE);
  const canWriteAnytime =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.SCALE_ATTENDANCE_WRITE_ANYTIME);

  if (!canWriteDraft && !canWriteAnytime) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para alterar chamada da escala",
        },
      },
      { status: 403 },
    );
  }

  const currentAttendanceResult =
    await scaleContainer.getScaleAttendance.execute({
      scaleId,
    });

  if (!currentAttendanceResult.ok) {
    return NextResponse.json(currentAttendanceResult, {
      status: getStatusByErrorCode(currentAttendanceResult.error?.code),
    });
  }

  if (!user.isSuperAdmin) {
    const hasAccess = user.churches.some(
      (church) =>
        church.churchId === currentAttendanceResult.value.attendance.churchId,
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para alterar chamada desta igreja",
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

  const parsed = SaveScaleAttendanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await scaleContainer.saveScaleAttendance.execute({
    scaleId,
    entries: parsed.data.entries,
    checkedByUserId: user.userId,
    allowPublishedEdit: canWriteAnytime,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : getStatusByErrorCode(result.error?.code),
  });
}
