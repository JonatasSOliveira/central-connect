import type { ApiResponse, ApiSuccess } from "@/shared/contracts/api-response";
import { HttpError } from "./http-error";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function httpRequest<T>(
  input: RequestInfo | URL,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(input, { ...options, body, headers });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    const error = payload.ok
      ? {
          code: "HTTP_ERROR",
          message: response.statusText || "Erro na requisição",
        }
      : payload.error;
    throw new HttpError(response.status, error);
  }

  return (payload as ApiSuccess<T>).value;
}
