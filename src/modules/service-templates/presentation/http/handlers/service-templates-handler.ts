import { type NextRequest, NextResponse } from "next/server";
import { canAccessChurch, getChurchIdFromSession } from "@/app/api/_lib/auth";
import type { CreateServiceTemplate } from "@/modules/service-templates/application/use-cases/CreateServiceTemplate";
import type { ListServiceTemplates } from "@/modules/service-templates/application/use-cases/ListServiceTemplates";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { CreateServiceTemplateInputSchema } from "../schemas/service-template-schema";

interface UseCases {
  listServiceTemplates: ListServiceTemplates;
  createServiceTemplate: CreateServiceTemplate;
}

export function createServiceTemplatesHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    GET: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.SERVICE_TEMPLATE_READ)
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para visualizar templates",
            },
          },
          { status: 403 },
        );
      const churchId = getChurchIdFromSession(
        auth.user,
        new URL(request.url).searchParams.get("churchId"),
      );
      if (!churchId)
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NO_CHURCH_SELECTED",
              message: "Nenhuma igreja selecionada",
            },
          },
          { status: 400 },
        );
      if (!canAccessChurch(auth.user, churchId))
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para acessar templates desta igreja",
            },
          },
          { status: 403 },
        );
      const result = await useCases.listServiceTemplates.execute({ churchId });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    POST: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.SERVICE_TEMPLATE_WRITE)
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para criar templates",
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
      const parsed = CreateServiceTemplateInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const churchId = getChurchIdFromSession(
        auth.user,
        new URL(request.url).searchParams.get("churchId"),
      );
      if (!churchId)
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NO_CHURCH_SELECTED",
              message: "Nenhuma igreja selecionada",
            },
          },
          { status: 400 },
        );
      if (!canAccessChurch(auth.user, churchId))
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para criar templates nesta igreja",
            },
          },
          { status: 403 },
        );
      const result = await useCases.createServiceTemplate.execute({
        ...parsed.data,
        churchId,
      });
      return NextResponse.json(result, {
        status: result.ok ? 201 : getHttpStatus(result.error?.code),
      });
    },
  };
}
