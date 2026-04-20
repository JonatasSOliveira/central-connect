import { type NextRequest, NextResponse } from "next/server";
import { FinalizeSelfSignupInputSchema } from "@/application/dtos/self-signup/FinalizeSelfSignupDTO";
import { selfSignupContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
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
  const clientIp = getClientIpAddress(request) ?? "unknown";
  const rateLimit = consumeRateLimit(
    `self-signup-finalize:${churchId}:${clientIp}`,
    {
      windowMs: 10 * 60 * 1000,
      max: 10,
    },
  );

  if (!rateLimit.allowed) {
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
    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  return NextResponse.json(result, { status: 201 });
}
