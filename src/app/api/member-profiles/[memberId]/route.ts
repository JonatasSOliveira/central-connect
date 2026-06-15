import { type NextRequest, NextResponse } from "next/server";
import { memberProfileContainer } from "@/infra/di";
import { getHttpStatus } from "@/shared/utils/apiResponse";
import { getChurchIdFromSession, validateSession } from "../../_lib/auth";
import { canReadMemberProfiles } from "../_lib/canReadMemberProfiles";

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const { user } = auth;
  const { memberId } = await params;
  const { searchParams } = new URL(request.url);
  const churchId = getChurchIdFromSession(user, searchParams.get("churchId"));

  if (!churchId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NO_CHURCH_SELECTED",
          message: "Nenhuma igreja selecionada",
        },
      },
      { status: 400 },
    );
  }

  if (!canReadMemberProfiles(user, churchId)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NOT_AUTHORIZED",
          message: "Sem permissao para acessar perfil deste membro",
        },
      },
      { status: 403 },
    );
  }

  const result = await memberProfileContainer.getMemberProfile.execute({
    churchId,
    memberId,
  });

  if (!result.ok) {
    const status =
      result.error.code === "MEMBER_PROFILE_NOT_FOUND"
        ? 404
        : getHttpStatus(result.error.code);

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
