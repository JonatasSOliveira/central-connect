import { type NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/app/api/_lib/auth";
import {
  RemovePushTokenSchema,
  UpsertPushTokenSchema,
} from "@/modules/notifications/application/dtos/PushTokenDTO";
import type { NotificationsInfrastructure } from "@/modules/notifications/infrastructure/composition/notifications-infrastructure";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

const PUSH_DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.PUSH_DEBUG === "true";

function tokenPreview(token: string): string {
  return token.length <= 12
    ? token
    : `${token.slice(0, 6)}...${token.slice(-6)}`;
}

function pushDebug(message: string, payload?: unknown): void {
  if (!PUSH_DEBUG_ENABLED) return;
  if (payload !== undefined)
    console.log(`[push-debug][api] ${message}`, payload);
  else console.log(`[push-debug][api] ${message}`);
}

function accessError(message: string, code = "NOT_AUTHORIZED", status = 403) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

async function readJson(request: NextRequest): Promise<unknown | NextResponse> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), { status: 400 });
  try {
    return await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
  }
}

export async function registerPushToken(
  request: NextRequest,
  dependencies: NotificationsInfrastructure,
) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  pushDebug("post start", { requestId });
  const auth = await validateSession();
  if (!auth.ok) {
    pushDebug("post unauthorized", { requestId, status: 401 });
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }
  if (!auth.user.memberId) return accessError("Usuário sem membro vinculado");
  if (!auth.user.churchId)
    return accessError("Nenhuma igreja selecionada", "NO_CHURCH_SELECTED", 400);

  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = UpsertPushTokenSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  pushDebug("upsert token request", {
    requestId,
    userId: auth.user.userId,
    memberId: auth.user.memberId,
    churchId: auth.user.churchId,
    platform: parsed.data.platform,
    deviceId: parsed.data.deviceId ?? null,
    token: tokenPreview(parsed.data.token),
  });
  const result = await dependencies.upsertMemberPushToken.execute({
    churchId: auth.user.churchId,
    memberId: auth.user.memberId,
    token: parsed.data.token,
    deviceId: parsed.data.deviceId,
    platform: parsed.data.platform,
    userId: auth.user.userId,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  pushDebug("upsert token response", {
    requestId,
    ok: result.ok,
    errorCode,
    tokenId: result.ok ? result.value.tokenId : null,
    durationMs: Date.now() - startedAt,
  });
  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function deactivatePushToken(
  request: NextRequest,
  dependencies: NotificationsInfrastructure,
) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  pushDebug("delete start", { requestId });
  const auth = await validateSession();
  if (!auth.ok)
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  if (!auth.user.memberId) return accessError("Usuário sem membro vinculado");
  if (!auth.user.churchId)
    return accessError("Nenhuma igreja selecionada", "NO_CHURCH_SELECTED", 400);

  const body = await readJson(request);
  if (body instanceof NextResponse) return body;
  const parsed = RemovePushTokenSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  pushDebug("deactivate token request", {
    requestId,
    userId: auth.user.userId,
    memberId: auth.user.memberId,
    churchId: auth.user.churchId,
    token: tokenPreview(parsed.data.token),
  });
  const result = await dependencies.deactivateMemberPushToken.execute({
    churchId: auth.user.churchId,
    memberId: auth.user.memberId,
    token: parsed.data.token,
  });
  const errorCode = "error" in result ? result.error?.code : undefined;
  pushDebug("deactivate token response", {
    requestId,
    ok: result.ok,
    errorCode,
    durationMs: Date.now() - startedAt,
  });
  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export function createPushTokenHandlers(
  dependencies: NotificationsInfrastructure,
) {
  return {
    register: (request: NextRequest) =>
      registerPushToken(request, dependencies),
    deactivate: (request: NextRequest) =>
      deactivatePushToken(request, dependencies),
  };
}
