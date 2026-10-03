import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession, validateSession } from "@/shared/presentation/http/auth";
import {
  PublishGeneratedScalesSchema,
  UnpublishGeneratedScalesSchema,
} from "@/modules/scales/application/dtos/generation/PublishGeneratedScalesDTO";
import type { ScalesHandlerDependencies } from "@/modules/scales/presentation/contracts/scales-handler-dependencies";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

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

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: { code: "NOT_AUTHORIZED", message: "Sem permissão para publicar escalas" } },
    { status: 403 },
  );
}

function noChurch() {
  return NextResponse.json(
    { ok: false, error: { code: "NO_CHURCH_SELECTED", message: "Nenhuma igreja selecionada" } },
    { status: 400 },
  );
}

async function publish(
  request: NextRequest,
  dependencies: ScalesHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  if (!auth.user.isSuperAdmin && !auth.user.permissions.includes(Permission.SCALE_WRITE)) {
    return unauthorized();
  }
  const churchId = getChurchIdFromSession(auth.user, null);
  if (!churchId) return noChurch();
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = PublishGeneratedScalesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), { status: 400 });
  }
  const result = await dependencies.scale.publishGeneratedScales.execute({
    ...parsed.data,
    churchId,
    publishedByUserId: auth.user.userId,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, { status: result.ok ? 200 : getHttpStatus(errorCode) });
}

async function unpublish(
  request: NextRequest,
  dependencies: ScalesHandlerDependencies,
) {
  const auth = await validateSession();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  if (!auth.user.isSuperAdmin && !auth.user.permissions.includes(Permission.SCALE_WRITE)) {
    return unauthorized();
  }
  const churchId = getChurchIdFromSession(auth.user, null);
  if (!churchId) return noChurch();
  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = UnpublishGeneratedScalesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), { status: 400 });
  }
  const result = await dependencies.scale.unpublishGeneratedScales.execute({
    ...parsed.data,
    churchId,
    unpublishedByUserId: auth.user.userId,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  return NextResponse.json(result, { status: result.ok ? 200 : getHttpStatus(errorCode) });
}

export function createScalePublicationHandlers(
  dependencies: ScalesHandlerDependencies,
) {
  return {
    publish: (request: NextRequest) => publish(request, dependencies),
    unpublish: (request: NextRequest) => unpublish(request, dependencies),
  };
}
