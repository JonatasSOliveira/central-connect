import type { ZodError } from "zod";
import { ApiErrors } from "@/application/errors/ApiErrors";
import { HttpStatus } from "@/shared/constants/HttpStatus";

const ERROR_STATUS_MAP: Record<
  string,
  (typeof HttpStatus)[keyof typeof HttpStatus]
> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  INVALID_JSON: HttpStatus.BAD_REQUEST,
  INVALID_CONTENT_TYPE: HttpStatus.BAD_REQUEST,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  INVALID_GOOGLE_TOKEN: HttpStatus.UNAUTHORIZED,
  NO_INVITE_FOUND: HttpStatus.FORBIDDEN,
  USER_CREATION_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function apiError(
  code:
    | keyof typeof ApiErrors
    | (typeof ApiErrors)[keyof typeof ApiErrors]["code"],
  details?: ZodError,
) {
  const errorDef = ApiErrors[code as keyof typeof ApiErrors];
  return {
    ok: false as const,
    error: {
      code: errorDef.code,
      message: errorDef.message,
      ...(details && { details: details.issues }),
    },
  };
}

export function getHttpStatus(
  errorCode?: string,
): (typeof HttpStatus)[keyof typeof HttpStatus] {
  return ERROR_STATUS_MAP[errorCode ?? ""] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
