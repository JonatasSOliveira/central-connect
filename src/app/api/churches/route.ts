import { type NextRequest, NextResponse } from "next/server";
import { CreateChurchInputSchema } from "@/application/dtos/church/CreateChurchDTO";
import { Permission } from "@/domain/enums/Permission";
import { churchContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { validateSession } from "../_lib/auth";

export async function GET() {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;

  const result = await churchContainer.listChurches.execute({
    isSuperAdmin: user.isSuperAdmin,
    userChurchIds: user.churches.map((c) => c.churchId),
  });

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const canCreateChurch =
    auth.user.isSuperAdmin ||
    auth.user.permissions.includes(Permission.CHURCH_WRITE);

  if (!canCreateChurch) {
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

  const creatorRoleId = auth.user.churches.find(
    (church) => church.churchId === auth.user.churchId,
  )?.roleId;

  const result = await churchContainer.createChurch.execute({
    name: parsed.data.name,
    selfSignupDefaultRoleId: parsed.data.selfSignupDefaultRoleId,
    maxConsecutiveScalesPerMember: parsed.data.maxConsecutiveScalesPerMember,
    createdByUserId: auth.user.userId,
    creatorMemberId: auth.user.memberId,
    creatorRoleId,
    isSuperAdmin: auth.user.isSuperAdmin,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
