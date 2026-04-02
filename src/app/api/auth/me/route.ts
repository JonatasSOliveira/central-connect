import { NextResponse } from "next/server";
import { churchContainer } from "@/infra/di";
import { validateSession } from "../../_lib/auth";

export async function GET() {
  const auth = await validateSession();

  if (!auth.ok) {
    return NextResponse.json({ ok: false, value: null }, { status: 401 });
  }

  const { user } = auth;

  let churchName: string | null = null;
  if (user.churchId) {
    const churchResult = await churchContainer.getChurch.execute({
      churchId: user.churchId,
    });
    if (churchResult.ok) {
      churchName = churchResult.value.church.name;
    }
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
      churchName: churchName,
      churches: auth.user.churches,
      permissions: auth.user.permissions,
    },
  });
}
