import { NextResponse } from "next/server";
import { container } from "@/infra/di/container";
import { validateSession } from "../../_lib/auth";

export async function GET() {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, value: null }, { status: 401 });
  }

  const memberRepository = container.memberRepository;
  const member = await memberRepository.findById(auth.user.memberId);

  if (!member) {
    const response = NextResponse.json(
      { ok: false, value: null },
      { status: 401 },
    );
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.json({
    ok: true,
    value: {
      userId: auth.user.userId,
      memberId: auth.user.memberId,
      email: auth.user.email,
      fullName: auth.user.fullName,
      avatarUrl: auth.user.avatarUrl ?? null,
      isSuperAdmin: auth.user.isSuperAdmin,
      churchId: auth.user.churchId ?? null,
    },
  });
}
