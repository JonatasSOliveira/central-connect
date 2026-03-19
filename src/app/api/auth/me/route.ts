import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ ok: false, value: null }, { status: 401 });
  }

  try {
    const tokenService = new JoseTokenJwtService();
    const session = await tokenService.verifyToken(token);

    return NextResponse.json({
      ok: true,
      value: {
        userId: session.userId,
        memberId: session.memberId,
        email: session.email,
        fullName: session.fullName,
        avatarUrl: session.avatarUrl ?? null,
        isSuperAdmin: session.isSuperAdmin,
        churchId: session.churchId ?? null,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, value: null }, { status: 401 });
  }
}
