import { type NextRequest, NextResponse } from "next/server";
import { Permission } from "@/domain/enums/Permission";
import { ministryContainer } from "@/infra/di";
import { getChurchIdFromSession, validateSession } from "../../_lib/auth";

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

  const result = await ministryContainer.listMinistries.execute({
    churchId,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }

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
