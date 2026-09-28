import { randomUUID } from "node:crypto";
import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import * as schema from "@/infra/database/drizzle/schema";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { MemberAvailabilityDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberAvailabilityDrizzleRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { createMembersComposition } from "@/modules/members/composition/members-composition";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import {
  createFinalizeSelfSignup,
  createScaleFixture,
  createUpdateScale,
  deleteScaleFixture,
} from "./database-transaction-flow-fixtures";
import { createMemberForm } from "./self-signup-test-form";

config({ path: path.resolve(process.cwd(), ".env.local") });
const databaseUrl = process.env.DATABASE_URL ?? "";
const parsedDatabaseUrl = new URL(databaseUrl);
const pool = new Pool({ connectionString: databaseUrl });
const database = drizzle(pool, { schema });

function assertLocalTestDatabase(): void {
  const local = ["localhost", "127.0.0.1", "::1"].includes(
    parsedDatabaseUrl.hostname,
  );
  if (!local || parsedDatabaseUrl.pathname !== "/central_connect")
    throw new Error(
      "Integration tests require local central_connect database.",
    );
}

describe("transactional business flows", () => {
  beforeAll(assertLocalTestDatabase);
  afterAll(async () => pool.end());

  it("rolls back member creation when a ministry relation fails", async () => {
    const churchId = randomUUID();
    const roleId = randomUUID();
    const email = `integration-${randomUUID()}@example.com`;
    await database
      .insert(schema.userRoles)
      .values({ id: roleId, name: `Role ${roleId}` });
    await database
      .insert(schema.churches)
      .values({ id: churchId, name: `Church ${churchId}` });
    const result =
      await createMembersComposition({
        database,
        memberRepository: new MemberDrizzleRepository(database),
        memberChurchRepository: new MemberChurchDrizzleRepository(database),
        memberMinistryRepository: new MemberMinistryDrizzleRepository(
          database,
        ),
        memberAvailabilityRepository: new MemberAvailabilityDrizzleRepository(
          database,
        ),
        createTransactionalRepositories: (executor) => [
          new MemberDrizzleRepository(executor),
          new MemberChurchDrizzleRepository(executor),
          new MemberMinistryDrizzleRepository(executor),
          new MemberAvailabilityDrizzleRepository(executor),
        ],
        churchRepository: new ChurchDrizzleRepository(database),
        roleRepository: new RoleDrizzleRepository(database),
      }).useCases.createMember.execute({
        email,
        fullName: "Member",
        churches: [{ churchId, roleId, ministryIds: [randomUUID()] }],
      });
    expect(result.ok).toBe(false);
    expect(
      await database
        .select()
        .from(schema.members)
        .where(eq(schema.members.email, email)),
    ).toHaveLength(0);
    await database
      .delete(schema.churches)
      .where(eq(schema.churches.id, churchId));
    await database
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.id, roleId));
  });

  it("rolls back scale updates after a duplicate member constraint failure", async () => {
    const fixture = await createScaleFixture(database);
    const updateScale = createTransactionalUseCase(database, (transaction) =>
      createUpdateScale(transaction),
    );
    const result = await updateScale.execute({
      scaleId: fixture.scaleId,
      churchId: fixture.churchId,
      serviceId: fixture.serviceId,
      ministryId: fixture.ministryId,
      status: "published",
      notes: "updated before failure",
      updatedByUserId: fixture.userId,
      members: [
        {
          id: null,
          memberId: fixture.memberId,
          ministryRoleId: fixture.ministryRoleId,
        },
        {
          id: null,
          memberId: fixture.memberId,
          ministryRoleId: fixture.ministryRoleId,
        },
      ],
    });
    expect(result.ok).toBe(false);
    const [scale] = await database
      .select()
      .from(schema.scales)
      .where(eq(schema.scales.id, fixture.scaleId));
    expect(scale?.status).toBe("draft");
    expect(scale?.notes).toBe("original notes");
    expect(
      await database
        .select()
        .from(schema.scaleMembers)
        .where(eq(schema.scaleMembers.scaleId, fixture.scaleId)),
    ).toHaveLength(0);
    await deleteScaleFixture(database, fixture);
  });

  it("rolls back self-signup after profile writes when ministry validation fails", async () => {
    const churchId = randomUUID();
    const roleId = randomUUID();
    const email = `signup-${randomUUID()}@example.com`;
    await database
      .insert(schema.userRoles)
      .values({ id: roleId, name: `Signup Role ${roleId}` });
    await database
      .insert(schema.churches)
      .values({
        id: churchId,
        name: `Signup Church ${churchId}`,
        selfSignupDefaultRoleId: roleId,
      });
    const finalize = createTransactionalUseCase(database, (transaction) =>
      createFinalizeSelfSignup(transaction, email),
    );
    const result = await finalize.execute({
      churchId,
      googleToken: "integration-token",
      fullName: "Signup Member",
      phone: "11999999999",
      acceptedTerms: true,
      ministryIds: [randomUUID()],
      confirmNoMinistry: false,
      memberForm: createMemberForm(),
    });
    expect(result.ok).toBe(false);
    expect(
      await database
        .select()
        .from(schema.members)
        .where(eq(schema.members.email, email)),
    ).toHaveLength(0);
    expect(
      await database
        .select()
        .from(schema.memberPersonalInfos)
        .where(eq(schema.memberPersonalInfos.churchId, churchId)),
    ).toHaveLength(0);
    expect(
      await database
        .select()
        .from(schema.legalConsents)
        .where(eq(schema.legalConsents.churchId, churchId)),
    ).toHaveLength(0);
    await database
      .delete(schema.churches)
      .where(eq(schema.churches.id, churchId));
    await database
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.id, roleId));
  });
});
