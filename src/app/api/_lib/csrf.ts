import type { NextRequest } from "next/server";

function getAllowedOrigins(): string[] {
  const origins = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL].filter(
    (value): value is string => Boolean(value),
  );

  return Array.from(new Set(origins));
}

export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    const host = request.headers.get("host");
    if (!host) {
      return false;
    }

    return origin === `${request.nextUrl.protocol}//${host}`;
  }

  return allowedOrigins.includes(origin);
}
