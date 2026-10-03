import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, inArray } from "drizzle-orm";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import * as schema from "@/infra/database/drizzle/schema";
import { ScaleGenerationCandidateDrizzleReader } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationCandidateDrizzleReader";
import { ScaleGenerationContextDrizzleReader } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationContextDrizzleReader";
import { ScaleGenerationHistoryDrizzleReader } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationHistoryDrizzleReader";
import { ScaleGenerationWriter } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleGenerationWriter";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { GenerateScalePreview } from "@/modules/scales/application/use-cases/GenerateScalePreview";
import { PublishGeneratedScales } from "@/modules/scales/application/use-cases/PublishGeneratedScales";
import { SaveGeneratedScale } from "@/modules/scales/application/use-cases/SaveGeneratedScale";
import { UnpublishGeneratedScales } from "@/modules/scales/application/use-cases/UnpublishGeneratedScales";
import {
  createScaleGenerationFixture,
  type ScaleGenerationFixture,
} from "@/infra/database/scale-generation.integration-fixtures";
import { deleteScaleGenerationFixture } from "@/infra/database/scale-generation.integration-cleanup";

config({ path: path.resolve(process.cwd(), ".env.local") });
const databaseUrl = process.env.DATABASE_URL ?? "";
const parsedDatabaseUrl = new URL(databaseUrl);
const pool = new Pool({ connectionString: databaseUrl });
const database = drizzle(pool, { schema });

function saveGeneratedScale(databaseExecutor: DatabaseClient) {
  return createTransactionalUseCase(databaseExecutor, (transaction) => {
    const contextReader = new ScaleGenerationContextDrizzleReader(transaction);
    return new SaveGeneratedScale(
      new ScaleGenerationWriter(
        new ScaleDrizzleRepository(transaction),
        new ScaleMemberDrizzleRepository(transaction),
      ),
      contextReader,
      new ScaleGenerationCandidateDrizzleReader(transaction),
      new ScaleGenerationHistoryDrizzleReader(transaction),
    );
  });
}

function publishGeneratedScales(databaseExecutor: DatabaseClient) {
  return createTransactionalUseCase(databaseExecutor, (transaction) => {
    const scaleRepository = new ScaleDrizzleRepository(transaction);
    const memberRepository = new ScaleMemberDrizzleRepository(transaction);
    const contextReader = new ScaleGenerationContextDrizzleReader(transaction);
    return new PublishGeneratedScales(
      scaleRepository,
      memberRepository,
      contextReader,
      new SaveGeneratedScale(
        new ScaleGenerationWriter(scaleRepository, memberRepository),
        contextReader,
        new ScaleGenerationCandidateDrizzleReader(transaction),
        new ScaleGenerationHistoryDrizzleReader(transaction),
      ),
    );
  });
}

function unpublishGeneratedScales(databaseExecutor: DatabaseClient) {
  return createTransactionalUseCase(databaseExecutor, (transaction) =>
    new UnpublishGeneratedScales(
      new ScaleDrizzleRepository(transaction),
      new ScaleGenerationContextDrizzleReader(transaction),
    ),
  );
}

describe("automatic scale generation with PostgreSQL", () => {
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

  it("generates a preview without persisting scales", async () => {
    fixture = await createScaleGenerationFixture(database);
    try {
      const before = await database.select().from(schema.scales).where(
        inArray(schema.scales.serviceId, [fixture.serviceId]),
      );
      const preview = await new GenerateScalePreview(
        new ScaleGenerationContextDrizzleReader(database),
        new ScaleGenerationCandidateDrizzleReader(database),
        new ScaleGenerationHistoryDrizzleReader(database),
      ).execute({
        churchId: fixture.churchId,
        serviceId: fixture.serviceId,
        ministryIds: [fixture.ministryId],
      });

      expect(preview.ok).toBe(true);
      const after = await database.select().from(schema.scales).where(
        inArray(schema.scales.serviceId, [fixture.serviceId]),
      );
      expect(after).toEqual(before);
    } finally {
      await deleteScaleGenerationFixture(database, fixture);
    }
  });

  it("saves, publishes and unpublishes while preserving members", async () => {
    fixture = await createScaleGenerationFixture(database);
    try {
      const saved = await saveGeneratedScale(database).execute({
        churchId: fixture.churchId,
        serviceId: fixture.serviceId,
        actorUserId: fixture.userId,
        status: "draft",
        mode: "replace-existing",
        ministries: [
          {
            ministryId: fixture.ministryId,
            assignments: [
              {
                memberId: fixture.versatileMemberId,
                ministryRoleId: fixture.roleId,
              },
            ],
          },
        ],
      });
      expect(saved.ok).toBe(true);
      const [draft] = await database
        .select()
        .from(schema.scales)
        .where(eq(schema.scales.serviceId, fixture.serviceId));
      expect(draft?.status).toBe("draft");
      if (!draft) throw new Error("Expected generated draft scale");
      const draftId = draft.id;

      const published = await publishGeneratedScales(database).execute({
        churchId: fixture.churchId,
        serviceId: fixture.serviceId,
        scaleIds: [draftId],
        publishedByUserId: fixture.userId,
      });
      expect(published.ok).toBe(true);
      const [publishedRow] = await database
        .select()
        .from(schema.scales)
        .where(eq(schema.scales.id, draftId));
      expect(publishedRow?.status).toBe("published");
      expect(publishedRow?.publishedByUserId).toBe(fixture.userId);
      expect(publishedRow?.publishedAt).not.toBeNull();

      const unpublished = await unpublishGeneratedScales(database).execute({
        churchId: fixture.churchId,
        serviceId: fixture.serviceId,
        scaleIds: [draftId],
        unpublishedByUserId: fixture.userId,
      });
      expect(unpublished.ok).toBe(true);
      const [draftAgain] = await database
        .select()
        .from(schema.scales)
        .where(eq(schema.scales.id, draftId));
      expect(draftAgain?.status).toBe("draft");
      expect(draftAgain?.publishedAt).toBeNull();
      expect(
        await database
          .select()
          .from(schema.scaleMembers)
          .where(eq(schema.scaleMembers.scaleId, draftId)),
      ).toHaveLength(1);
    } finally {
      await deleteScaleGenerationFixture(database, fixture);
    }
  });
});
