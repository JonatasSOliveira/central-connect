import { SignInWithGoogleInputSchema } from "@/application/dtos/auth/SignInWithGoogle.input.dto";
import { compositionRoot } from "@/compositionRoot";
import { zodToApiError } from "@/infra/zod/mapper";
import { ApiError } from "@/shared/errors/Api.error";
import { Result } from "@/shared/result/Result";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = SignInWithGoogleInputSchema.safeParse(body);
  if (!parsed.success) {
    const error = zodToApiError(parsed.error);
    return NextResponse.json(Result.err(error), {
      status: error.status_code,
    });
  }

  const result = await compositionRoot.signInWithGoogleUseCase.execute(
    parsed.data,
  );
  const statusCode = result.isSuccess ? 200 : result.error.status_code;
  return NextResponse.json(result, { status: statusCode });
}
