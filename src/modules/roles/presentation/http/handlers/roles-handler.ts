import { type NextRequest, NextResponse } from "next/server";
import type { CreateRole } from "@/modules/roles/application/use-cases/CreateRole";
import type { ListRoles } from "@/modules/roles/application/use-cases/ListRoles";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { CreateRoleInputSchema } from "../schemas/role-schema";

interface RoleUseCases {
  createRole: CreateRole;
  listRoles: ListRoles;
}

export function createRolesHandler(
  useCases: RoleUseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    GET: async () => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.ROLE_READ)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para visualizar cargos",
            },
          },
          { status: 403 },
        );
      }
      const result = await useCases.listRoles.execute();
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    POST: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (!auth.user.isSuperAdmin)
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Apenas superadministradores podem criar cargos",
            },
          },
          { status: 403 },
        );
      if (!request.headers.get("content-type")?.includes("application/json")) {
        return NextResponse.json(apiError("INVALID_CONTENT_TYPE"), {
          status: 400,
        });
      }
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(apiError("INVALID_JSON"), { status: 400 });
      }
      const parsed = CreateRoleInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.createRole.execute(parsed.data);
      return NextResponse.json(result, {
        status: result.ok ? 201 : getHttpStatus(result.error?.code),
      });
    },
  };
}
