import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import type { DatabaseTransaction } from "@/infra/database/contracts/database-executor";
import { TransactionRejected } from "@/infra/database/run-in-database-transaction";
import { runInDatabaseTransaction } from "@/infra/database/run-in-database-transaction";
import type { Result } from "@/shared/types/Result";

interface ExecutableUseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}

export function createTransactionalUseCase<Input, Output>(
  database: DatabaseClient,
  createUseCase: (
    transaction: DatabaseTransaction,
  ) => ExecutableUseCase<Input, Output>,
): ExecutableUseCase<Input, Output> {
  return {
    async execute(input: Input): Promise<Result<Output>> {
      try {
        return await runInDatabaseTransaction(database, async (transaction) => {
          const result = await createUseCase(transaction).execute(input);

          if (!result.ok) {
            throw new TransactionRejected(result);
          }

          return result;
        });
      } catch (error) {
        if (error instanceof TransactionRejected) {
          return error.result as Result<Output>;
        }

        throw error;
      }
    },
  };
}
