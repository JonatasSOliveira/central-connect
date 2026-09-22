export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  ok: true;
  value: T;
}

export interface ApiFailure {
  ok: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
