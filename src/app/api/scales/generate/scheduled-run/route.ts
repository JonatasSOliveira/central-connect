import { type NextRequest, NextResponse } from "next/server";
import { scaleContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

const INTERNAL_API_KEY_HEADER = "x-internal-api-key";
const EXPECTED_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(request: NextRequest) {
  const providedKey = request.headers.get(INTERNAL_API_KEY_HEADER);

  if (!EXPECTED_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Chave de API interna não configurada",
        },
      },
      { status: 500 },
    );
  }

  if (providedKey !== EXPECTED_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Acesso não autorizado",
        },
      },
      { status: 401 },
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

  const input = body as { churchIds?: string[]; lookaheadDays?: number };

  const useCase = scaleContainer.runScheduledScaleGeneration;

  const result = await useCase.execute({
    churchIds: input.churchIds,
    lookaheadDays: input.lookaheadDays ?? 7,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}