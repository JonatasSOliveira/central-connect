import type { NextRequest } from "next/server";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  event: string;
  requestId?: string;
  route?: string;
  status?: number;
  userId?: string | null;
  memberId?: string | null;
  churchId?: string | null;
  errorCode?: string | null;
  details?: Record<string, unknown>;
}

function getLogMethod(level: LogLevel): (message?: unknown, ...optionalParams: unknown[]) => void {
  if (level === "error") {
    return console.error;
  }

  if (level === "warn") {
    return console.warn;
  }

  return console.log;
}

export function logEvent(level: LogLevel, payload: LogPayload): void {
  const logMethod = getLogMethod(level);

  logMethod(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      ...payload,
    }),
  );
}

export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}
