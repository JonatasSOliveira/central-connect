import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_AUTHENTICATED" } },
      { status: 401 },
    );
  }

  try {
    const tokenService = new JoseTokenJwtService();
    const session = await tokenService.verifyToken(token);

    const body = await request.json();
    const { churchId } = body;

    if (!churchId || typeof churchId !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CHURCH_ID" } },
        { status: 400 },
      );
    }

    const newSessionPayload = {
      ...session,
      churchId,
    };

    const newToken = await tokenService.generateToken(newSessionPayload);

    cookieStore.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      ok: true,
      value: { churchId },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_SESSION" } },
      { status: 401 },
    );
  }
}
