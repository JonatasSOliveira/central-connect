import { Result } from "@/shared/result/Result";

export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}
