import { type NextRequest, NextResponse } from "next/server";
import { CreateChurchInputSchema } from "@/application/dtos/church/CreateChurchDTO";
import { churchContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { requireSuperAdmin, validateSession } from "../_lib/auth";

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

  const superAdminCheck = requireSuperAdmin(auth.user);
  if (superAdminCheck) {
    return NextResponse.json(
      { ok: false, error: superAdminCheck.error },
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

  const result = await churchContainer.createChurch.execute({
    name: parsed.data.name,
    selfSignupDefaultRoleId: parsed.data.selfSignupDefaultRoleId,
    createdByUserId: auth.user.userId,
  });

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 201 : getHttpStatus(errorCode),
  });
}
