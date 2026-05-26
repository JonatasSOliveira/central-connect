import { type NextRequest, NextResponse } from "next/server";
import {
  ListMyScalesQuerySchema,
  type MyScalesPeriod,
} from "@/application/dtos/scale/MyScalesDTO";
import { Permission } from "@/domain/enums/Permission";
import { scaleContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

export async function GET(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const canReadMyScales =
    user.isSuperAdmin || user.permissions.includes(Permission.MY_SCALES_READ);
  const canReadOwnScales =
    user.isSuperAdmin || user.permissions.includes(Permission.SCALE_SELF_READ);

  if (!canReadMyScales && !canReadOwnScales) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissão para visualizar suas escalas",
        },
      },
      { status: 403 },
    );
  }

  if (!user.memberId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Usuário sem membro vinculado",
        },
      },
      { status: 403 },
    );
  }

  if (!user.churchId) {
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

  const { searchParams } = new URL(request.url);
  const periodRaw = searchParams.get("period") ?? "upcoming";
  const parsed = ListMyScalesQuerySchema.safeParse({ period: periodRaw });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Período inválido",
        },
      },
      { status: 400 },
    );
  }

  const result = await scaleContainer.listMyScales.execute({
    churchId: user.churchId,
    memberId: user.memberId,
    period: parsed.data.period as MyScalesPeriod,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
