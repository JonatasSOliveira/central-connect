import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { CreateChurchInputSchema } from "@/application/dtos/church/CreateChurchDTO";
import { ChurchErrors } from "@/application/errors/churchErrors";
import { container } from "@/infra/di/container";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";
import { HttpStatus } from "@/shared/constants/HttpStatus";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

interface SessionPayload {
  userId: string;
  isSuperAdmin: boolean;
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Não autenticado" },
      },
      { status: 401 },
    );
  }

  let session: SessionPayload;
  try {
    const tokenService = new JoseTokenJwtService();
    session = (await tokenService.verifyToken(
      token,
    )) as unknown as SessionPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_TOKEN", message: "Token inválido" },
      },
      { status: 401 },
    );
  }

  if (!session.isSuperAdmin) {
    return NextResponse.json(
      { ok: false, error: ChurchErrors.NOT_AUTHORIZED },
      { status: HttpStatus.FORBIDDEN },
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

  const parsed = CreateChurchInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const result = await container.createChurch.execute({
    name: parsed.data.name,
    createdByUserId: session.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
