import { type NextRequest, NextResponse } from "next/server";
import { canAccessChurch, getChurchIdFromSession } from "@/app/api/_lib/auth";
import type { DeleteService } from "@/modules/services/application/use-cases/DeleteService";
import type { GetService } from "@/modules/services/application/use-cases/GetService";
import type { UpdateService } from "@/modules/services/application/use-cases/UpdateService";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { UpdateServiceInputSchema } from "../schemas/service-schema";

interface UseCases {
  getService: GetService;
  updateService: UpdateService;
  deleteService: DeleteService;
}

export function createServiceHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  const context = async (request: NextRequest, permission?: Permission) => {
    const auth = await validateSession();
    if (!auth.ok) return { response: NextResponse.json(auth, { status: 401 }) };
    if (
      permission &&
      !auth.user.isSuperAdmin &&
      !auth.user.permissions.includes(permission)
    )
      return {
        response: NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para acessar este culto",
            },
          },
          { status: 403 },
        ),
      };
    const churchId = getChurchIdFromSession(
      auth.user,
      new URL(request.url).searchParams.get("churchId"),
    );
    if (!churchId)
      return {
        response: NextResponse.json(
          {
            ok: false,
            error: {
              code: "NO_CHURCH_SELECTED",
              message: "Nenhuma igreja selecionada",
            },
          },
          { status: 400 },
        ),
      };
    if (!canAccessChurch(auth.user, churchId))
      return {
        response: NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para acessar cultos desta igreja",
            },
          },
          { status: 403 },
        ),
      };
    return { auth, churchId };
  };
  return {
    GET: async (request: NextRequest, serviceId: string) => {
      const ctx = await context(request);
      if (ctx.response) return ctx.response;
      const result = await useCases.getService.execute({
        serviceId,
        churchId: ctx.churchId,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    PUT: async (request: NextRequest, serviceId: string) => {
      const ctx = await context(request, Permission.SERVICE_WRITE);
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
      const parsed = UpdateServiceInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.updateService.execute({
        ...parsed.data,
        serviceId,
        churchId: ctx.churchId,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    DELETE: async (request: NextRequest, serviceId: string) => {
      const ctx = await context(request, Permission.SERVICE_DELETE);
      if (ctx.response) return ctx.response;
      const result = await useCases.deleteService.execute({
        serviceId,
        churchId: ctx.churchId,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
  };
}
