import type { NextRequest } from "next/server";

function getAllowedOrigins(): string[] {
  const origins = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL].filter(
    (value): value is string => Boolean(value),
  );

  return Array.from(new Set(origins));
}

export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    return true;
  }

  if (origin === "null") {
    const referer = request.headers.get("referer");

    if (!referer || !host) {
      return false;
    }

    try {
      const refererHost = new URL(referer).host;
      return refererHost === host;
    } catch {
      return false;
    }
  }

  const allowedOrigins = getAllowedOrigins();
  const sameHostOrigin = host ? `${request.nextUrl.protocol}//${host}` : null;

  if (sameHostOrigin && origin === sameHostOrigin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    if (!host) {
      return false;
    }

    return origin === `${request.nextUrl.protocol}//${host}`;
  }

  return allowedOrigins.includes(origin);
}
