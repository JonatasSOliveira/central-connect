import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { container } from "@/infra/di/container";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

interface SessionPayload {
  userId: string;
  memberId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
  churchId: string | null;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ ok: false, value: null }, { status: 401 });
  }

  try {
    const tokenService = new JoseTokenJwtService();
    const session = (await tokenService.verifyToken(
      token,
    )) as unknown as SessionPayload;

    const memberRepository = container.memberRepository;
    const member = await memberRepository.findById(session.memberId);

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
