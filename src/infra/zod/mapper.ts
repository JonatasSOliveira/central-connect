import { ApiError } from "@/shared/errors/Api.error";
import { ZodError } from "zod";

export function zodToApiError(error: ZodError): ApiError {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    fields[field] = issue.message;
  }

  return {
    status_code: 400,
    code: "INVALID_INPUT",
    message: error.issues[0].message,
    meta: fields,
  };
}
