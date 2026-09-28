import type { DatabaseClient } from "./database-client";

export type DatabaseTransaction = Parameters<
  Parameters<DatabaseClient["transaction"]>[0]
>[0];

export type DatabaseExecutor = DatabaseClient | DatabaseTransaction;
