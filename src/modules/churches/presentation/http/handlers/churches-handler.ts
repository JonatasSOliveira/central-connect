import { type NextRequest, NextResponse } from "next/server";
import type { CreateChurch } from "@/modules/churches/application/use-cases/CreateChurch";
import type { ListChurches } from "@/modules/churches/application/use-cases/ListChurches";
import type { AuthResult } from "@/shared/contracts/auth";
import { Permission } from "@/shared/domain/enums/Permission";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { CreateChurchInputSchema } from "../schemas/church-schema";

interface UseCases {
  listChurches: ListChurches;
  createChurch: CreateChurch;
}

export function createChurchesHandler(
  useCases: UseCases,
  validateSession: () => Promise<AuthResult>,
) {
  return {
    GET: async () => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      const result = await useCases.listChurches.execute({
        isSuperAdmin: auth.user.isSuperAdmin,
        userChurchIds: auth.user.churches.map((church) => church.churchId),
      });
      return NextResponse.json(result, {
        status: result.ok ? 200 : getHttpStatus(result.error?.code),
      });
    },
    POST: async (request: NextRequest) => {
      const auth = await validateSession();
      if (!auth.ok) return NextResponse.json(auth, { status: 401 });
      if (
        !auth.user.isSuperAdmin &&
        !auth.user.permissions.includes(Permission.CHURCH_WRITE)
      )
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NOT_AUTHORIZED",
              message: "Sem permissão para criar igrejas",
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
      const parsed = CreateChurchInputSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
          status: 400,
        });
      const creatorRoleId = auth.user.churches.find(
        (church) => church.churchId === auth.user.churchId,
      )?.roleId;
      const result = await useCases.createChurch.execute({
        ...parsed.data,
        createdByUserId: auth.user.userId,
        creatorMemberId: auth.user.memberId,
        creatorRoleId,
        isSuperAdmin: auth.user.isSuperAdmin,
      });
      return NextResponse.json(result, {
        status: result.ok ? 201 : getHttpStatus(result.error?.code),
      });
    },
  };
}
