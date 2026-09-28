import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "@/infra/database/drizzle/schema";

export type DatabaseClient = NodePgDatabase<typeof schema>;
