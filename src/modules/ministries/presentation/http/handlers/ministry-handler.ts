import { Permission } from "@/shared/domain/enums/Permission";
import {
  canAccessChurch,
  hasPermission,
} from "@/shared/presentation/http/auth-context";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import type { MinistryUseCases, ValidateSession } from "../ministry-http-types";
import { MinistryFormSchema } from "../schemas/ministry-schema";

export class MinistryHandler {
  constructor(
    private readonly useCases: MinistryUseCases,
    private readonly validateSession: ValidateSession,
  ) {}

  async get(ministryId: string): Promise<Response> {
    const auth = await this.validateSession();
    if (!auth.ok) return this.unauthorized(auth.error);
    if (!hasPermission(auth.user, Permission.MINISTRY_READ)) {
      return this.forbidden("Sem permissão para visualizar ministérios");
    }

    const result = await this.useCases.getMinistry.execute({ ministryId });
    if (!result.ok) return this.result(result, 404);
    if (!canAccessChurch(auth.user, result.value.ministry.churchId)) {
      return this.forbidden(
        "Sem permissão para visualizar ministérios desta igreja",
      );
    }
    return Response.json(result, { status: 200 });
  }

  async update(ministryId: string, request: Request): Promise<Response> {
    const auth = await this.validateSession();
    if (!auth.ok) return this.unauthorized(auth.error);
    if (!hasPermission(auth.user, Permission.MINISTRY_WRITE)) {
      return this.forbidden("Sem permissão para atualizar ministérios");
    }

    const current = await this.useCases.getMinistry.execute({ ministryId });
    if (!current.ok) return this.result(current, 404);

    if (!canAccessChurch(auth.user, current.value.ministry.churchId)) {
      return this.forbidden(
        "Sem permissão para atualizar ministérios desta igreja",
      );
    }

    const body = await this.readJson(request);
    if (!body.ok) return body.response;
    const parsed = MinistryFormSchema.safeParse(body.value);
    if (!parsed.success) {
      return Response.json(apiError("VALIDATION_ERROR", parsed.error), {
        status: 400,
      });
    }

    const result = await this.useCases.updateMinistry.execute({
      ministryId,
      churchId: current.value.ministry.churchId,
      name: parsed.data.name,
      leaderId: parsed.data.leaderId,
      notes: parsed.data.notes,
      roles: parsed.data.roles.map((role) => ({
        id: role.id ?? null,
        name: role.name,
        requiredCount: role.requiredCount,
      })),
      updatedByUserId: auth.user.userId,
    });

    return this.result(result, 200);
  }

  async delete(ministryId: string): Promise<Response> {
    const auth = await this.validateSession();
    if (!auth.ok) return this.unauthorized(auth.error);
    if (!hasPermission(auth.user, Permission.MINISTRY_DELETE)) {
      return this.forbidden("Sem permissão para excluir ministérios");
    }

    const current = await this.useCases.getMinistry.execute({ ministryId });
    if (!current.ok) return this.result(current, 404);
    if (!canAccessChurch(auth.user, current.value.ministry.churchId)) {
      return this.forbidden(
        "Sem permissão para excluir ministérios desta igreja",
      );
    }

    const result = await this.useCases.deleteMinistry.execute({ ministryId });
    if (result.ok) return new Response(null, { status: 204 });
    return this.result(result, 204);
  }

  private async readJson(
    request: Request,
  ): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return {
        ok: false,
        response: Response.json(apiError("INVALID_CONTENT_TYPE"), {
          status: 400,
        }),
      };
    }

    try {
      return { ok: true, value: await request.json() };
    } catch {
      return {
        ok: false,
        response: Response.json(apiError("INVALID_JSON"), { status: 400 }),
      };
    }
  }

  private result(
    result: { ok: boolean; error?: { code: string }; [key: string]: unknown },
    successStatus: number,
  ): Response {
    return Response.json(result, {
      status: result.ok ? successStatus : getHttpStatus(result.error?.code),
    });
  }

  private unauthorized(error: { code: string; message: string }): Response {
    return Response.json({ ok: false, error }, { status: 401 });
  }

  private forbidden(message: string): Response {
    return Response.json(
      { ok: false, error: { code: "NOT_AUTHORIZED", message } },
      { status: 403 },
    );
  }
}
