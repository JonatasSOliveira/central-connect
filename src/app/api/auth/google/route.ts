import { SignInWithGoogleInputSchema } from "@/application/dtos/auth/SignInWithGoogle.input.dto";
import { compositionRoot } from "@/compositionRoot";
import { zodToApiError } from "@/infra/zod/mapper";
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
    parsed.data
  );
  const statusCode = result.isSuccess ? 200 : result.error.status_code;
  const response = NextResponse.json(result, { status: statusCode });

  if (result.isSuccess) {
    response.cookies.set({
      name: "access_token",
      value: result.value.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
