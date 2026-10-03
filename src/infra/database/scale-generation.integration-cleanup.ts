import { eq, inArray } from "drizzle-orm";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import * as schema from "@/infra/database/drizzle/schema";
import type { ScaleGenerationFixture } from "./scale-generation.integration-fixtures";

export async function deleteScaleGenerationFixture(
  database: DatabaseClient,
  fixture: ScaleGenerationFixture,
): Promise<void> {
  const scaleRows = await database
    .select({ id: schema.scales.id })
    .from(schema.scales)
    .where(
      inArray(schema.scales.serviceId, [
        fixture.serviceId,
        fixture.conflictingServiceId,
      ]),
    );
  const scaleIds = scaleRows.map((row) => row.id);
  const memberIds = [
    fixture.eligibleMemberId,
    fixture.unavailableMemberId,
    fixture.versatileMemberId,
  ];
  if (scaleIds.length > 0) {
    await database
      .delete(schema.scaleMembers)
      .where(inArray(schema.scaleMembers.scaleId, scaleIds));
  }
  await database.delete(schema.scales).where(
    inArray(schema.scales.serviceId, [fixture.serviceId, fixture.conflictingServiceId]),
  );
  await database.delete(schema.memberAvailabilities).where(
    inArray(schema.memberAvailabilities.memberId, memberIds),
  );
  await database.delete(schema.memberMinistryRoles).where(
    inArray(schema.memberMinistryRoles.memberId, memberIds),
  );
  await database.delete(schema.memberMinistries).where(
    inArray(schema.memberMinistries.memberId, memberIds),
  );
  await database.delete(schema.memberChurches).where(
    inArray(schema.memberChurches.memberId, memberIds),
  );
  await database.delete(schema.members).where(inArray(schema.members.id, memberIds));
  await database.delete(schema.ministryRoles).where(
    inArray(schema.ministryRoles.ministryId, [fixture.ministryId, fixture.secondMinistryId]),
  );
  await database.delete(schema.ministries).where(
    inArray(schema.ministries.id, [fixture.ministryId, fixture.secondMinistryId]),
  );
  await database.delete(schema.services).where(
    inArray(schema.services.id, [fixture.serviceId, fixture.conflictingServiceId]),
  );
  await database.delete(schema.users).where(eq(schema.users.id, fixture.userId));
  await database.delete(schema.churches).where(
    inArray(schema.churches.id, [fixture.churchId, fixture.otherChurchId]),
  );
}
