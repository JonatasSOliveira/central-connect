import type { ApiErrorPayload } from "@/shared/contracts/api-response";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: ApiErrorPayload,
  ) {
    super(payload.message);
    this.name = "HttpError";
  }
}
