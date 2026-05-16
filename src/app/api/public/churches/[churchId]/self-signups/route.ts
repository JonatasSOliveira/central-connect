import { type NextRequest, NextResponse } from "next/server";
import { FinalizeSelfSignupInputSchema } from "@/application/dtos/self-signup/FinalizeSelfSignupDTO";
import { selfSignupContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { consumeRateLimit } from "@/shared/utils/rateLimit";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

function getClientIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;

  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp || null;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;
  const requestId = getRequestId(request);
  const clientIp = getClientIpAddress(request) ?? "unknown";
  const rateLimit = consumeRateLimit(
    `self-signup-finalize:${churchId}:${clientIp}`,
    {
      windowMs: 10 * 60 * 1000,
      max: 10,
    },
  );

  if (!rateLimit.allowed) {
    logEvent("warn", {
      event: "self_signup_finalize_rate_limited",
      requestId,
      route: "/api/public/churches/[churchId]/self-signups",
      status: 429,
      churchId,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Muitas tentativas. Tente novamente em alguns minutos.",
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

  const parsed = FinalizeSelfSignupInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const ipAddress = getClientIpAddress(request);
  const userAgent = request.headers.get("user-agent");

  const result = await selfSignupContainer.finalizeSelfSignup.execute({
    churchId,
    googleToken: parsed.data.googleToken,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    acceptedTerms: parsed.data.acceptedTerms,
    ipAddress,
    userAgent,
  });

  if (!result.ok) {
    logEvent("warn", {
      event: "self_signup_finalize_failed",
      requestId,
      route: "/api/public/churches/[churchId]/self-signups",
      status: getHttpStatus(result.error.code),
      churchId,
      errorCode: result.error.code,
    });

    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  logEvent("info", {
    event: "self_signup_finalize_success",
    requestId,
    route: "/api/public/churches/[churchId]/self-signups",
    status: 201,
    churchId,
  });

  return NextResponse.json(result, { status: 201 });
}
