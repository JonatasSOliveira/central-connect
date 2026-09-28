import { createNodePostgresClient } from "@/infra/database/providers/node-postgres/create-node-postgres-client";

export const createDatabaseClient = createNodePostgresClient;
