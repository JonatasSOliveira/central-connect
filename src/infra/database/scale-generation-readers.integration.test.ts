import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/infra/database/drizzle/schema";
import { ScaleGenerationCandidateDrizzleReader } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationCandidateDrizzleReader";
import { ScaleGenerationHistoryDrizzleReader } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationHistoryDrizzleReader";
import {
  createScaleGenerationFixture,
  type ScaleGenerationFixture,
} from "./scale-generation.integration-fixtures";
import { deleteScaleGenerationFixture } from "./scale-generation.integration-cleanup";

config({ path: path.resolve(process.cwd(), ".env.local") });
const databaseUrl = process.env.DATABASE_URL ?? "";
const parsedDatabaseUrl = new URL(databaseUrl);
const pool = new Pool({ connectionString: databaseUrl });
const database = drizzle(pool, { schema });

describe("scale generation persistence readers", () => {
  let fixture: ScaleGenerationFixture;

  beforeAll(() => {
    if (
      !["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname) ||
      parsedDatabaseUrl.pathname !== "/central_connect"
    ) {
      throw new Error("Integration tests require local central_connect database.");
    }
  });

  afterAll(async () => pool.end());

  it("filters candidates and excludes exact-time conflicts", async () => {
    fixture = await createScaleGenerationFixture(database);
    try {
      const reader = new ScaleGenerationCandidateDrizzleReader(database);
      const filtered = await reader.findCandidates({
        churchId: fixture.churchId,
        ministryIds: [fixture.ministryId],
        roleIds: [fixture.roleId],
        serviceDayOfWeek: "Sunday",
      });
      expect(filtered.map((candidate) => candidate.memberId)).toEqual(
        expect.arrayContaining([fixture.eligibleMemberId, fixture.versatileMemberId]),
      );
      expect(filtered.map((candidate) => candidate.memberId)).not.toContain(
        fixture.unavailableMemberId,
      );

      const history = new ScaleGenerationHistoryDrizzleReader(database);
      await expect(
        history.findExactTimeConflicts(
          fixture.churchId,
          [fixture.eligibleMemberId],
          new Date("2035-10-07"),
          "19:00",
          fixture.serviceId,
        ),
      ).resolves.toEqual([fixture.eligibleMemberId]);
    } finally {
      await deleteScaleGenerationFixture(database, fixture);
    }
  });
});
