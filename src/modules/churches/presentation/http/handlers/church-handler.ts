import { type NextRequest, NextResponse } from "next/server";
import { canAccessChurch, hasAnyPermission } from "@/app/api/_lib/auth";
import type { DeleteChurch } from "@/modules/churches/application/use-cases/DeleteChurch";
import type { GetChurch } from "@/modules/churches/application/use-cases/GetChurch";
import type { UpdateChurch } from "@/modules/churches/application/use-cases/UpdateChurch";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { CreateChurchInputSchema } from "../schemas/church-schema";

interface UseCases {
  getChurch: GetChurch;
  updateChurch: UpdateChurch;
  deleteChurch: DeleteChurch;
}

export function createChurchHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  const context = async (churchId: string, permissions: Permission[]) => {
    const auth = await validateSession();
    if (!auth.ok) return { response: NextResponse.json(auth, { status: 401 }) };
    if (
      !canAccessChurch(auth.user, churchId) ||
      !hasAnyPermission(auth.user, permissions)
    )
      return {
        response: NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para acessar esta igreja",
            },
          },
          { status: 403 },
        ),
      };
    return { auth };
  };
  return {
    GET: async (_request: NextRequest, churchId: string) => {
      const ctx = await context(churchId, [
        Permission.CHURCH_READ,
        Permission.CHURCH_SELF_READ,
      ]);
      if (ctx.response) return ctx.response;
      const result = await useCases.getChurch.execute({ churchId });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    PUT: async (request: NextRequest, churchId: string) => {
      const ctx = await context(churchId, [
        Permission.CHURCH_WRITE,
        Permission.CHURCH_SELF_WRITE,
      ]);
      if (ctx.response) return ctx.response;
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
      const parsed = CreateChurchInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.updateChurch.execute({
        ...parsed.data,
        churchId,
        updatedByUserId: ctx.auth.user.userId,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    DELETE: async (_request: NextRequest, churchId: string) => {
      const ctx = await context(churchId, [Permission.CHURCH_DELETE]);
      if (ctx.response) return ctx.response;
      const result = await useCases.deleteChurch.execute({ churchId });
      if (!result.ok)
        return NextResponse.json(result, {
          status: getHttpStatus(result.error?.code),
        });
      return new NextResponse(null, { status: 204 });
    },
  };
}
