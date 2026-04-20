import { type NextRequest, NextResponse } from "next/server";
import { selfSignupContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";
import { consumeRateLimit } from "@/shared/utils/rateLimit";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;
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
    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  return NextResponse.json(result, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=60",
    },
  });
}
