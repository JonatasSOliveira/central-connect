import { type NextRequest, NextResponse } from "next/server";
import { canAccessChurch } from "@/app/api/_lib/auth";
import type { GenerateWeekServices } from "@/modules/service-templates/application/use-cases/GenerateWeekServices";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { GenerateWeekInputSchema } from "../schemas/service-template-schema";

export function createGenerateWeekHandler(
  useCases: { generateWeekServices: GenerateWeekServices },
  validateSession: () => Promise<AuthResult>,
) {
  return async (request: NextRequest) => {
    const auth = await validateSession();
    if (!auth.ok) return NextResponse.json(auth, { status: 401 });
    if (
      !auth.user.isSuperAdmin &&
      !auth.user.permissions.includes(Permission.SERVICE_TEMPLATE_GENERATE)
    )
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para gerar cultos da semana",
          },
        },
        { status: 403 },
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
    const parsed = GenerateWeekInputSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
        status: 400,
      });
    if (!canAccessChurch(auth.user, parsed.data.churchId))
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para gerar cultos nesta igreja",
          },
        },
        { status: 403 },
      );
    const result = await useCases.generateWeekServices.execute({
      ...parsed.data,
      generatedByUserId: auth.user.userId,
    });
    return NextResponse.json(result, {
      status: result.ok ? 201 : getHttpStatus(result.error?.code),
    });
  };
}
