import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import { createDatabaseClient } from "@/infra/database/providers/node-postgres/create-database-client";

let databaseClient: DatabaseClient | undefined;

export function getDatabaseClient(): DatabaseClient {
  databaseClient ??= createDatabaseClient();
  return databaseClient;
}
