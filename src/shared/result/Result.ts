// src/shared/result/Result.ts

export type MatchHandlers<T, E, R> = {
  ok: (value: T) => R;
  err: (error: E) => R;
};

export abstract class Result<T, E> {
  abstract readonly isSuccess: boolean;
  abstract readonly isFailure: boolean;

  abstract match<R>(handlers: MatchHandlers<T, E, R>): R;

  static ok<T>(value: T): Result<T, never> {
    return new Ok(value);
  }

  static err<E>(error: E): Result<never, E> {
    return new Err(error);
  }

  static wrap<T, E = unknown>(fn: () => T): Result<T, E> {
    try {
      return Result.ok(fn());
    } catch (error) {
      return Result.err(error as E);
    }
  }

  static async wrapAsync<T, E = unknown>(
    fn: () => Promise<T>
  ): Promise<Result<T, E>> {
    try {
      return Result.ok(await fn());
    } catch (error) {
      return Result.err(error as E);
    }
  }
}

class Ok<T> extends Result<T, never> {
  readonly isSuccess = true;
  readonly isFailure = false;

  constructor(private readonly value: T) {
    super();
  }

  match<R>(handlers: MatchHandlers<T, never, R>): R {
    return handlers.ok(this.value);
  }
}

class Err<E> extends Result<never, E> {
  readonly isSuccess = false;
  readonly isFailure = true;

  constructor(private readonly error: E) {
    super();
  }

  match<R>(handlers: MatchHandlers<never, E, R>): R {
    return handlers.err(this.error);
  }
}