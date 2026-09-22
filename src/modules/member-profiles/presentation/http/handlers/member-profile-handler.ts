import { type NextRequest, NextResponse } from "next/server";
import { getChurchIdFromSession } from "@/app/api/_lib/auth";
import { canReadMemberProfiles } from "@/app/api/member-profiles/_lib/canReadMemberProfiles";
import type { GetMemberProfile } from "@/modules/member-profiles/application/use-cases/GetMemberProfile";
import type { AuthResult } from "@/shared/contracts/auth";
import { getHttpStatus } from "@/shared/utils/apiResponse";

export function createMemberProfileHandler(
  useCases: { getMemberProfile: GetMemberProfile },
  validateSession: () => Promise<AuthResult>,
) {
  return async (request: NextRequest, memberId: string) => {
    const auth = await validateSession();
    if (!auth.ok) return NextResponse.json(auth, { status: 401 });
    const churchId = getChurchIdFromSession(
      auth.user,
      new URL(request.url).searchParams.get("churchId"),
    );
    if (!churchId)
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
    if (!canReadMemberProfiles(auth.user, churchId))
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
    const result = await useCases.getMemberProfile.execute({
      churchId,
      memberId,
    });
    const status = result.ok
      ? 200
      : result.error.code === "MEMBER_PROFILE_NOT_FOUND"
        ? 404
        : getHttpStatus(result.error.code);
    return NextResponse.json(result, { status });
  };
}
