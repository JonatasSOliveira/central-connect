import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession, validateSession } from "@/shared/presentation/http/auth";
import { GenerateScalePreviewSchema } from "@/modules/scales/application/dtos/generation/GenerateScalePreviewDTO";
import { SaveGeneratedScaleSchema } from "@/modules/scales/application/dtos/generation/SaveGeneratedScaleDTO";
import type { ScalesHandlerDependencies } from "@/modules/scales/presentation/contracts/scales-handler-dependencies";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

function unauthorized(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message } },
    { status: 403 },
  );
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

function selectedChurch(user: Awaited<ReturnType<typeof validateSession>>) {
  if (!user.ok) return null;
  return getChurchIdFromSession(user.user, null);
}

async function preview(
  request: NextRequest,
  dependencies: ScalesHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }
  if (!auth.user.isSuperAdmin && !auth.user.permissions.includes(Permission.SCALE_WRITE)) {
    return unauthorized("Sem permissão para gerar prévias de escalas");
  }
  const churchId = selectedChurch(auth);
  if (!churchId) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_CHURCH_SELECTED", message: "Nenhuma igreja selecionada" } },
      { status: 400 },
    );
  }
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = GenerateScalePreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), { status: 400 });
  }
  const result = await dependencies.scale.generateScalePreview.execute({
    churchId,
    serviceId: parsed.data.serviceId,
    ministryIds: parsed.data.ministryIds,
    mode: parsed.data.mode,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, { status: result.ok ? 200 : getHttpStatus(errorCode) });
}

async function save(
  request: NextRequest,
  dependencies: ScalesHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }
  if (!auth.user.isSuperAdmin && !auth.user.permissions.includes(Permission.SCALE_WRITE)) {
    return unauthorized("Sem permissão para salvar escalas");
  }
  const churchId = selectedChurch(auth);
  if (!churchId) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_CHURCH_SELECTED", message: "Nenhuma igreja selecionada" } },
      { status: 400 },
    );
  }
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = SaveGeneratedScaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), { status: 400 });
  }
  const result = await dependencies.scale.saveGeneratedScale.execute({
    ...parsed.data,
    churchId,
    actorUserId: auth.user.userId,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, { status: result.ok ? 200 : getHttpStatus(errorCode) });
}

export function createScaleGenerationPreviewHandlers(
  dependencies: ScalesHandlerDependencies,
) {
  return {
    preview: (request: NextRequest) => preview(request, dependencies),
    save: (request: NextRequest) => save(request, dependencies),
  };
}
