import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseConfig } from "@/infra/database/config/database-config";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import * as schema from "@/infra/database/drizzle/schema";

export function createNodePostgresClient(): DatabaseClient {
  const pool = new Pool({ connectionString: getDatabaseConfig().url });
  return drizzle(pool, { schema });
}
