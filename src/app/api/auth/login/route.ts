import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AuthLoginInputSchema } from "@/application/dtos/auth/AuthLoginInputDTO";
import { authContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { isTrustedOrigin } from "../../_lib/csrf";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  if (!isTrustedOrigin(request)) {
    logEvent("warn", {
      event: "auth_login_untrusted_origin",
      requestId,
      route: "/api/auth/login",
      status: 403,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNTRUSTED_ORIGIN",
          message: "Origem da requisição não confiável",
        },
      },
      { status: 403 },
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

  const parsed = AuthLoginInputSchema.safeParse(body);
  if (!parsed.success) {
    logEvent("warn", {
      event: "auth_login_validation_error",
      requestId,
      route: "/api/auth/login",
      status: 400,
    });

    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await authContainer.authLoginUseCase.execute(parsed.data);
  const errorCode = "error" in result ? result.error?.code : undefined;

  if (result.ok && result.value?.sessionToken) {
    const cookieStore = await cookies();
    cookieStore.set("session", result.value.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  logEvent(result.ok ? "info" : "warn", {
    event: result.ok ? "auth_login_success" : "auth_login_failed",
    requestId,
    route: "/api/auth/login",
    status: result.ok ? 200 : getHttpStatus(errorCode),
    userId: result.ok ? result.value.userId : null,
    memberId: result.ok ? result.value.memberId : null,
    churchId: result.ok ? (result.value.churchId ?? null) : null,
    errorCode: result.ok ? null : errorCode ?? null,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
