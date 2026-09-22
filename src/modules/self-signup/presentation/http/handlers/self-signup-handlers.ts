import { type NextRequest, NextResponse } from "next/server";
import type { FinalizeSelfSignupInputDTO } from "@/modules/self-signup/application/dtos/FinalizeSelfSignupDTO";
import {
  FinalizeSelfSignupInputSchema,
  LookupSelfSignupMemberInputSchema,
} from "@/modules/self-signup/presentation/http/schemas/self-signup-schema";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { getRequestId, logEvent } from "@/shared/utils/logger";
import { consumeRateLimit } from "@/shared/utils/rateLimit";

interface Result {
  ok: boolean;
  value?: unknown;
  error?: { code: string };
}

interface UseCases {
  getSelfSignupChurchContext: {
    execute(input: { churchId: string }): Promise<Result>;
  };
  lookupMemberByPhone: {
    execute(input: { churchId: string; phone: string }): Promise<Result>;
  };
  finalizeSelfSignup: {
    execute(
      input: FinalizeSelfSignupInputDTO & {
        churchId: string;
        ipAddress: string | null;
        userAgent: string | null;
      },
    ): Promise<Result>;
  };
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function tooMany(retryAfterSeconds: number, message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "TOO_MANY_REQUESTS", message } },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export function createSelfSignupHandlers(useCases: UseCases) {
  return {
    context: async (request: NextRequest, churchId: string) => {
      const requestId = getRequestId(request);
      const rate = consumeRateLimit(
        `self-signup-context:${churchId}:${clientIp(request)}`,
        { windowMs: 60_000, max: 60 },
      );
      if (!rate.allowed)
        return tooMany(
          rate.retryAfterSeconds,
          "Muitas requisições. Tente novamente em instantes.",
        );
      const result = await useCases.getSelfSignupChurchContext.execute({
        churchId,
      });
      if (!result.ok) {
        logEvent("warn", {
          event: "self_signup_context_failed",
          requestId,
          churchId,
          errorCode: result.error?.code,
        });
        return NextResponse.json(result, {
          status: getHttpStatus(result.error?.code),
        });
      }
      return NextResponse.json(result, {
        status: 200,
        headers: { "Cache-Control": "public, max-age=30, s-maxage=60" },
      });
    },
    lookup: async (request: NextRequest, churchId: string) => {
      const rate = consumeRateLimit(
        `self-signup-lookup:${churchId}:${clientIp(request)}`,
        { windowMs: 300_000, max: 20 },
      );
      if (!rate.allowed)
        return tooMany(
          rate.retryAfterSeconds,
          "Muitas tentativas. Tente novamente em alguns minutos.",
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
      const parsed = LookupSelfSignupMemberInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.lookupMemberByPhone.execute({
        churchId,
        phone: parsed.data.phone,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    finalize: async (request: NextRequest, churchId: string) => {
      const rate = consumeRateLimit(
        `self-signup-finalize:${churchId}:${clientIp(request)}`,
        { windowMs: 600_000, max: 10 },
      );
      if (!rate.allowed)
        return tooMany(
          rate.retryAfterSeconds,
          "Muitas tentativas. Tente novamente em alguns minutos.",
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
      const parsed = FinalizeSelfSignupInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.finalizeSelfSignup.execute({
        churchId,
        ...parsed.data,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: request.headers.get("user-agent"),
      });
      if (!result.ok)
        return NextResponse.json(result, {
          status: getHttpStatus(result.error?.code),
        });
      return NextResponse.json(result, { status: 201 });
    },
  };
}
