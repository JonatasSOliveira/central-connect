import type { Result } from "@/shared/types/Result";

export abstract class BaseUseCase<Input, Output> {
  abstract execute(input: Input): Promise<Result<Output>>;
}
