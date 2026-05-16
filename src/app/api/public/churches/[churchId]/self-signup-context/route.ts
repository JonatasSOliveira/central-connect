import { type NextRequest, NextResponse } from "next/server";
import { selfSignupContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { consumeRateLimit } from "@/shared/utils/rateLimit";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;
  const requestId = getRequestId(_request);
  const clientIp =
    _request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = consumeRateLimit(
    `self-signup-context:${churchId}:${clientIp}`,
    {
      windowMs: 60 * 1000,
      max: 60,
    },
  );

  if (!rateLimit.allowed) {
    logEvent("warn", {
      event: "self_signup_context_rate_limited",
      requestId,
      route:
        "/api/public/churches/[churchId]/self-signup-context",
      status: 429,
      churchId,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Muitas requisições. Tente novamente em instantes.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const result = await selfSignupContainer.getSelfSignupChurchContext.execute({
    churchId,
  });

  if (!result.ok) {
    logEvent("warn", {
      event: "self_signup_context_failed",
      requestId,
      route:
        "/api/public/churches/[churchId]/self-signup-context",
      status: getHttpStatus(result.error.code),
      churchId,
      errorCode: result.error.code,
    });

    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  logEvent("info", {
    event: "self_signup_context_success",
    requestId,
    route: "/api/public/churches/[churchId]/self-signup-context",
    status: 200,
    churchId,
  });

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=60",
    },
  });
}
