import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthLoginInputSchema } from "@/application/dtos/auth/AuthLoginInputDTO";
import { container } from "@/infra/container";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = AuthLoginInputSchema.parse(body);

    const result = await container.authLoginUseCase.execute(validatedInput);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: 400 },
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
