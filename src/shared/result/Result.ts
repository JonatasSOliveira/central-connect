import { ApiError } from "../errors/Api.error";

export type Ok<T> = {
  isSuccess: true;
  value: T;
};

export type Err = {
  isSuccess: false;
  error: ApiError;
};

export type Result<T> = Ok<T> | Err;

export const Result = {
  ok<T>(value: T): Result<T> {
    return { isSuccess: true, value };
  },

  err(error: ApiError): Result<never> {
    return { isSuccess: false, error };
  },
};
