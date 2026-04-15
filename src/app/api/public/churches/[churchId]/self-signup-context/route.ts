import { type NextRequest, NextResponse } from "next/server";
import { selfSignupContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";

interface RouteParams {
  params: Promise<{ churchId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { churchId } = await params;

  const result = await selfSignupContainer.getSelfSignupChurchContext.execute({
    churchId,
  });

  if (!result.ok) {
    return NextResponse.json(result, {
      status: getHttpStatus(result.error.code),
    });
  }

  return NextResponse.json(result, { status: 200 });
}
