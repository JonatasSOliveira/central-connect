import { type NextRequest, NextResponse } from "next/server";
import { AuthLoginInputSchema } from "@/application/dtos/auth/AuthLoginInputDTO";
import { container } from "@/infra/di/container";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

export async function POST(request: NextRequest) {
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
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await container.authLoginUseCase.execute(parsed.data);
  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: getHttpStatus(errorCode),
  });
}
