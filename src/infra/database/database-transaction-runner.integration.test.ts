import { randomUUID } from "node:crypto";
import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import * as schema from "@/infra/database/drizzle/schema";
import { runInDatabaseTransaction } from "@/infra/database/run-in-database-transaction";

config({ path: path.resolve(process.cwd(), ".env.local") });
const databaseUrl = process.env.DATABASE_URL ?? "";
const parsedDatabaseUrl = new URL(databaseUrl);
const pool = new Pool({ connectionString: databaseUrl });
const database = drizzle(pool, { schema });

describe("database transaction runner", () => {
  beforeAll(() => {
    if (
      !["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname) ||
      parsedDatabaseUrl.pathname !== "/central_connect"
    )
      throw new Error(
        "Integration tests require local central_connect database.",
      );
  });
  afterAll(async () => pool.end());

  it("commits related inserts", async () => {
    const churchId = randomUUID();
    const memberId = randomUUID();
    await runInDatabaseTransaction(database, async (transaction) => {
      await transaction
        .insert(schema.churches)
        .values({ id: churchId, name: `Church ${churchId}` });
      await transaction
        .insert(schema.members)
        .values({ id: memberId, fullName: `Member ${memberId}` });
    });
    expect(
      await database
        .select()
        .from(schema.churches)
        .where(eq(schema.churches.id, churchId)),
    ).toHaveLength(1);
    await database
      .delete(schema.members)
      .where(eq(schema.members.id, memberId));
    await database
      .delete(schema.churches)
      .where(eq(schema.churches.id, churchId));
  });

  it("rolls back when the transaction throws", async () => {
    const churchId = randomUUID();
    await expect(
      runInDatabaseTransaction(database, async (transaction) => {
        await transaction
          .insert(schema.churches)
          .values({ id: churchId, name: `Rollback ${churchId}` });
        throw new Error("forced rollback");
      }),
    ).rejects.toThrow("forced rollback");
    expect(
      await database
        .select()
        .from(schema.churches)
        .where(eq(schema.churches.id, churchId)),
    ).toHaveLength(0);
  });

  it("rolls back when a transactional use case returns failure", async () => {
    const churchId = randomUUID();
    const useCase = createTransactionalUseCase(database, (transaction) => ({
      execute: async () => {
        await transaction
          .insert(schema.churches)
          .values({ id: churchId, name: `Rejected ${churchId}` });
        return {
          ok: false as const,
          error: { code: "FORCED_FAILURE", message: "forced" },
        };
      },
    }));
    expect((await useCase.execute(undefined)).ok).toBe(false);
    expect(
      await database
        .select()
        .from(schema.churches)
        .where(eq(schema.churches.id, churchId)),
    ).toHaveLength(0);
  });
});
