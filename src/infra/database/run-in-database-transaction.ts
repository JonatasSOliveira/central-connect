import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import type { DatabaseTransaction } from "@/infra/database/contracts/database-executor";

export class TransactionRejected extends Error {
  constructor(readonly result: unknown) {
    super("Database transaction rejected");
    this.name = "TransactionRejected";
  }
}

export async function runInDatabaseTransaction<T>(
  database: DatabaseClient,
  operation: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return database.transaction((transaction) => operation(transaction));
}
