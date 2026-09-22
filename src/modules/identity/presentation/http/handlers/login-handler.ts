import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "@/app/api/_lib/csrf";
import { AuthLoginInputSchema } from "@/modules/identity/application/dtos/AuthLoginInputDTO";
import type { AuthLoginUseCase } from "@/modules/identity/application/use-cases/AuthLoginUseCase";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";

export function createLoginHandler(dependencies: {
  authLoginUseCase: AuthLoginUseCase;
}) {
  return async (request: NextRequest) => {
    const requestId = getRequestId(request);
    if (!isTrustedOrigin(request))
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
    if (!request.headers.get("content-type")?.includes("application/json"))
      return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), {
        status: 400,
      });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
    }
    const parsed = AuthLoginInputSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
        status: 400,
      });
    const result = await dependencies.authLoginUseCase.execute(parsed.data);
    const errorCode = result.ok ? undefined : result.error.code;
    if (result.ok && result.value.sessionToken)
      (await cookies()).set("session", result.value.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    logEvent(result.ok ? "info" : "warn", {
      event: result.ok ? "auth_login_success" : "auth_login_failed",
      requestId,
      route: "/api/auth/login",
      status: result.ok ? 200 : getHttpStatus(errorCode),
    });
    return NextResponse.json(result, {
      status: result.ok ? 200 : getHttpStatus(errorCode),
    });
  };
}
