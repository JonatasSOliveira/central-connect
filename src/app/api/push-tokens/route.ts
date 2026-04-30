import { type NextRequest, NextResponse } from "next/server";
import {
  RemovePushTokenSchema,
  UpsertPushTokenSchema,
} from "@/application/dtos/notification/PushTokenDTO";
import { notificationContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

const PUSH_DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.PUSH_DEBUG === "true";

function tokenPreview(token: string): string {
  if (token.length <= 12) {
    return token;
  }

  return `${token.slice(0, 6)}...${token.slice(-6)}`;
}

function pushDebug(message: string, payload?: unknown): void {
  if (!PUSH_DEBUG_ENABLED) {
    return;
  }

  if (payload !== undefined) {
    console.log(`[push-debug][api] ${message}`, payload);
    return;
  }

  console.log(`[push-debug][api] ${message}`);
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  pushDebug("post start", { requestId });
  const auth = await validateSession();

  if (!auth.ok) {
    pushDebug("post unauthorized", {
      requestId,
      status: 401,
      reason: auth.error.code,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  if (!auth.user.memberId) {
    pushDebug("post forbidden: user without member", {
      requestId,
      status: 403,
      reason: "NOT_AUTHORIZED",
      durationMs: Date.now() - startedAt,
    });
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

  if (!auth.user.churchId) {
    pushDebug("post invalid: no church selected", {
      requestId,
      status: 400,
      reason: "NO_CHURCH_SELECTED",
      durationMs: Date.now() - startedAt,
    });
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

  const parsed = UpsertPushTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  pushDebug("upsert token request", {
    requestId,
    userId: auth.user.userId,
    memberId: auth.user.memberId,
    churchId: auth.user.churchId,
    platform: parsed.data.platform,
    deviceId: parsed.data.deviceId ?? null,
    token: tokenPreview(parsed.data.token),
  });

  const result = await notificationContainer.upsertMemberPushToken.execute({
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

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  pushDebug("delete start", { requestId });
  const auth = await validateSession();

  if (!auth.ok) {
    pushDebug("delete unauthorized", {
      requestId,
      status: 401,
      reason: auth.error.code,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  if (!auth.user.memberId) {
    pushDebug("delete forbidden: user without member", {
      requestId,
      status: 403,
      reason: "NOT_AUTHORIZED",
      durationMs: Date.now() - startedAt,
    });
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

  if (!auth.user.churchId) {
    pushDebug("delete invalid: no church selected", {
      requestId,
      status: 400,
      reason: "NO_CHURCH_SELECTED",
      durationMs: Date.now() - startedAt,
    });
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

  const parsed = RemovePushTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  pushDebug("deactivate token request", {
    requestId,
    userId: auth.user.userId,
    memberId: auth.user.memberId,
    churchId: auth.user.churchId,
    token: tokenPreview(parsed.data.token),
  });

  const result = await notificationContainer.deactivateMemberPushToken.execute({
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
