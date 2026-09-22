import { Permission } from "@/shared/domain/enums/Permission";
import {
  canAccessChurch,
  getChurchIdFromSession,
  hasPermission,
} from "@/shared/presentation/http/auth-context";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import type { MinistryUseCases, ValidateSession } from "../ministry-http-types";
import { MinistryFormSchema } from "../schemas/ministry-schema";

export class MinistriesHandler {
  constructor(
    private readonly useCases: MinistryUseCases,
    private readonly validateSession: ValidateSession,
  ) {}

  async list(request: Request): Promise<Response> {
    const auth = await this.validateSession();
    if (!auth.ok) return this.unauthorized(auth.error);

    const { user } = auth;
    const searchParams = new URL(request.url).searchParams;
    const queryChurchId = searchParams.get("churchId");
    const churchId = getChurchIdFromSession(user, queryChurchId);

    if (!hasPermission(user, Permission.MINISTRY_READ)) {
      return this.forbidden("Sem permissão para visualizar ministérios");
    }

    if (!churchId && !user.isSuperAdmin) {
      return this.badRequest(
        "NO_CHURCH_SELECTED",
        "Nenhuma igreja selecionada",
      );
    }

    if (
      queryChurchId &&
      !user.isSuperAdmin &&
      !canAccessChurch(user, queryChurchId)
    ) {
      return this.forbidden("Sem permissão para acessar esta igreja");
    }

    const result = await this.useCases.listMinistries.execute({
      churchId: churchId || undefined,
      excludeServiceId: searchParams.get("serviceId") || undefined,
      excludeScaleId: searchParams.get("excludeScaleId") || undefined,
    });

    return this.result(result, 200);
  }

  async create(request: Request): Promise<Response> {
    const auth = await this.validateSession();
    if (!auth.ok) return this.unauthorized(auth.error);

    const { user } = auth;
    if (!hasPermission(user, Permission.MINISTRY_WRITE)) {
      return this.forbidden("Sem permissão para criar ministérios");
    }

    const churchId = getChurchIdFromSession(user, null);
    if (!churchId) {
      return this.badRequest(
        "NO_CHURCH_SELECTED",
        "Nenhuma igreja selecionada",
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

    const result = await this.useCases.createMinistry.execute({
      churchId,
      name: parsed.data.name,
      leaderId: parsed.data.leaderId,
      notes: parsed.data.notes,
      roles: parsed.data.roles,
      createdByUserId: user.userId,
    });

    return this.result(result, 201);
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

  private badRequest(code: string, message: string): Response {
    return Response.json(
      { ok: false, error: { code, message } },
      { status: 400 },
    );
  }
}
