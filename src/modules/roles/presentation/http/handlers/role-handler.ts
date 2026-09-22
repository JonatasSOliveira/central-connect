import { type NextRequest, NextResponse } from "next/server";
import type { DeleteRole } from "@/modules/roles/application/use-cases/DeleteRole";
import type { GetRole } from "@/modules/roles/application/use-cases/GetRole";
import type { UpdateRole } from "@/modules/roles/application/use-cases/UpdateRole";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { UpdateRoleInputSchema } from "../schemas/role-schema";

interface RoleUseCases {
  getRole: GetRole;
  updateRole: UpdateRole;
  deleteRole: DeleteRole;
}

export function createRoleHandler(
  useCases: RoleUseCases,
  validateSession: () => Promise<AuthResult>,
) {
  const authorize = async (permission: Permission) => {
    const auth = await validateSession();
    if (!auth.ok) return NextResponse.json(auth, { status: 401 });
    if (
      !auth.user.isSuperAdmin &&
      !auth.user.permissions.includes(permission)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Sem permissão para acessar este cargo",
          },
        },
        { status: 403 },
      );
    }
    return auth;
  };
  return {
    GET: async (_request: NextRequest, roleId: string) => {
      const auth = await authorize(Permission.ROLE_READ);
      if (auth instanceof NextResponse) return auth;
      const result = await useCases.getRole.execute({ roleId });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    PUT: async (request: NextRequest, roleId: string) => {
      const auth = await authorize(Permission.ROLE_WRITE);
      if (auth instanceof NextResponse) return auth;
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
      const parsed = UpdateRoleInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const result = await useCases.updateRole.execute({
        roleId,
        ...parsed.data,
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    DELETE: async (_request: NextRequest, roleId: string) => {
      const auth = await authorize(Permission.ROLE_DELETE);
      if (auth instanceof NextResponse) return auth;
      const result = await useCases.deleteRole.execute({ roleId });
      if (!result.ok)
        return NextResponse.json(result, {
          status: getHttpStatus(result.error?.code),
        });
      return new NextResponse(null, { status: 204 });
    },
  };
}
