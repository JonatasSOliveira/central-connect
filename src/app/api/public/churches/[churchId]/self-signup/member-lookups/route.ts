import { type NextRequest, NextResponse } from "next/server";
import { LookupSelfSignupMemberInputSchema } from "@/application/dtos/self-signup/LookupSelfSignupMemberDTO";
import { selfSignupContainer } from "@/infra/di";
import { apiError, getHttpStatus } from "@/shared/utils/apiResponse";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

  const parsed = LookupSelfSignupMemberInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("VALIDATION_ERROR", parsed.error), {
      status: 400,
    });
  }

  const { churchId } = await params;

  const result = await selfSignupContainer.lookupMemberByPhone.execute({
    churchId,
    phone: parsed.data.phone,
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  return NextResponse.json(result, { status: 200 });
}
