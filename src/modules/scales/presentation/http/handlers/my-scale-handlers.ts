import { type NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/api/_lib/auth";
import {
  ListMyScalesQuerySchema,
  type MyScalesPeriod,
} from "@/modules/scales/application/dtos/MyScalesDTO";
import type { ScalesInfrastructure } from "@/modules/scales/infrastructure/composition/scales-infrastructure";
import { Permission } from "@/shared/domain/enums/Permission";
import { getHttpStatus } from "@/shared/utils/apiResponse";

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
}

export async function listMyScales(
  request: NextRequest,
  dependencies: ScalesInfrastructure,
) {
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  const { user } = auth;
  const canRead =
    user.isSuperAdmin ||
    user.permissions.includes(Permission.MY_SCALES_READ) ||
    user.permissions.includes(Permission.SCALE_SELF_READ);
  if (!canRead)
    return unauthorized("Sem permissão para visualizar suas escalas");
  if (!user.memberId) return unauthorized("Usuário sem membro vinculado");
  if (!user.churchId)
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

  const period = new URL(request.url).searchParams.get("period") ?? "upcoming";
  const parsed = ListMyScalesQuerySchema.safeParse({ period });
  if (!parsed.success)
    return NextResponse.json(
      {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Período inválido" },
      },
      { status: 400 },
    );

  const result = await dependencies.scale.listMyScales.execute({
    churchId: user.churchId,
    memberId: user.memberId,
    period: parsed.data.period as MyScalesPeriod,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
