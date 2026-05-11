import { type NextRequest, NextResponse } from "next/server";
import { LookupSelfSignupMemberInputSchema } from "@/application/dtos/self-signup/LookupSelfSignupMemberDTO";
import { selfSignupContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { consumeRateLimit } from "@/shared/utils/rateLimit";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;
  const requestId = getRequestId(request);
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rateLimit = consumeRateLimit(
    `self-signup-lookup:${churchId}:${clientIp}`,
    {
      windowMs: 5 * 60 * 1000,
      max: 20,
    },
  );

  if (!rateLimit.allowed) {
    logEvent("warn", {
      event: "self_signup_lookup_rate_limited",
      requestId,
      route:
        "/api/public/churches/[churchId]/self-signup/member-lookups",
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

  const parsed = LookupSelfSignupMemberInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await selfSignupContainer.lookupMemberByPhone.execute({
    churchId,
    phone: parsed.data.phone,
  });

  if (!result.ok) {
    logEvent("warn", {
      event: "self_signup_lookup_failed",
      requestId,
      route: "/api/public/churches/[churchId]/self-signup/member-lookups",
      status: getHttpStatus(result.error.code),
      churchId,
      errorCode: result.error.code,
    });

    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  logEvent("info", {
    event: "self_signup_lookup_success",
    requestId,
    route: "/api/public/churches/[churchId]/self-signup/member-lookups",
    status: 200,
    churchId,
  });

  return NextResponse.json(result, { status: 200 });
}
