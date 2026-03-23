import { type NextRequest, NextResponse } from "next/server";
import { memberContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";
import { requireSuperAdmin, validateSession } from "../../_lib/auth";

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { memberId } = await params;
  const result = await memberContainer.getMember.execute(memberId);

  if (!result.ok) {
    const errorCode = result.error?.code;
    return NextResponse.json(result, {
      status: getHttpStatus(errorCode),
    });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const { memberId } = await params;
  const result = await memberContainer.getMember.execute(memberId);

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

  const { memberId } = await params;
  const result = await memberContainer.getMember.execute(memberId);

  const errorCode = "error" in result ? result.error?.code : undefined;

  return NextResponse.json(result, {
    status: result.ok ? 200 : getHttpStatus(errorCode),
  });
}
