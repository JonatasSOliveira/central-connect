import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isTrustedOrigin } from "../../_lib/csrf";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNTRUSTED_ORIGIN",
          message: "Origem da requisição não confiável",
        },
      },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.delete("session");

  return NextResponse.json({ ok: true });
}
