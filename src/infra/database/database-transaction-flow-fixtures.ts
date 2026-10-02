import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import * as schema from "@/infra/database/drizzle/schema";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { LegalConsentDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/LegalConsentDrizzleRepository";
import { UserDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/UserDrizzleRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { MemberMinistryRoleDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryRoleDrizzleRepository";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import { MinistryRoleDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryRoleDrizzleRepository";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";
import { FinalizeSelfSignup } from "@/modules/self-signup/application/use-cases/FinalizeSelfSignup";
import { getSelfSignupMemberFormRepositories } from "@/modules/self-signup/infrastructure/composition/member-form-repositories";
import { ServiceDrizzleRepository } from "@/modules/services/infrastructure/persistence/drizzle/ServiceDrizzleRepository";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { UpdateScale } from "@/modules/scales/application/use-cases/UpdateScale";

export function createUpdateScale(database: DatabaseExecutor) {
  return new UpdateScale(
    new ScaleDrizzleRepository(database),
    new ScaleMemberDrizzleRepository(database),
    new ChurchDrizzleRepository(database),
    new ServiceDrizzleRepository(database),
    new MinistryDrizzleRepository(database),
    new MinistryRoleDrizzleRepository(database),
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
    new MemberMinistryRoleDrizzleRepository(database),
  );
}

export function createFinalizeSelfSignup(
  database: DatabaseExecutor,
  email: string,
) {
  return new FinalizeSelfSignup(
    new ChurchDrizzleRepository(database),
    new RoleDrizzleRepository(database),
    new RolePermissionDrizzleRepository(database),
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
    new MinistryDrizzleRepository(database),
    new UserDrizzleRepository(database),
    new LegalConsentDrizzleRepository(database),
    {
      verifyGoogleToken: async () => ({
        email,
        name: "Signup Member",
        sub: randomUUID(),
      }),
    },
    getSelfSignupMemberFormRepositories(database),
  );
}

export interface ScaleFixture {
  churchId: string;
  serviceId: string;
  ministryId: string;
  ministryRoleId: string;
  memberId: string;
  scaleId: string;
  userId: string;
}

export async function createScaleFixture(
  database: DatabaseClient,
): Promise<ScaleFixture> {
  const fixture = {
    churchId: randomUUID(),
    serviceId: randomUUID(),
    ministryId: randomUUID(),
    ministryRoleId: randomUUID(),
    memberId: randomUUID(),
    scaleId: randomUUID(),
    userId: randomUUID(),
  };
  await database
    .insert(schema.churches)
    .values({ id: fixture.churchId, name: `Scale Church ${fixture.churchId}` });
  await database.insert(schema.services).values({
    id: fixture.serviceId,
    churchId: fixture.churchId,
    title: "Integration Service",
    dayOfWeek: "sunday",
    time: "10:00",
    date: new Date("2030-01-01"),
  });
  await database.insert(schema.ministries).values({
    id: fixture.ministryId,
    churchId: fixture.churchId,
    name: `Scale Ministry ${fixture.ministryId}`,
  });
  await database.insert(schema.ministryRoles).values({
    id: fixture.ministryRoleId,
    ministryId: fixture.ministryId,
    name: `Scale Role ${fixture.ministryRoleId}`,
  });
  await database.insert(schema.members).values({
    id: fixture.memberId,
    fullName: "Scale Member",
    email: `scale-${fixture.memberId}@example.com`,
  });
  await database
    .insert(schema.memberChurches)
    .values({ memberId: fixture.memberId, churchId: fixture.churchId });
  await database.insert(schema.memberMinistries).values({
    memberId: fixture.memberId,
    churchId: fixture.churchId,
    ministryId: fixture.ministryId,
  });
  await database.insert(schema.scales).values({
    id: fixture.scaleId,
    serviceId: fixture.serviceId,
    ministryId: fixture.ministryId,
    status: "draft",
    notes: "original notes",
  });
  return fixture;
}

export async function deleteScaleFixture(
  database: DatabaseClient,
  fixture: ScaleFixture,
): Promise<void> {
  await database
    .delete(schema.scaleMembers)
    .where(eq(schema.scaleMembers.scaleId, fixture.scaleId));
  await database
    .delete(schema.scales)
    .where(eq(schema.scales.id, fixture.scaleId));
  await database
    .delete(schema.memberMinistries)
    .where(eq(schema.memberMinistries.memberId, fixture.memberId));
  await database
    .delete(schema.memberChurches)
    .where(eq(schema.memberChurches.memberId, fixture.memberId));
  await database
    .delete(schema.members)
    .where(eq(schema.members.id, fixture.memberId));
  await database
    .delete(schema.ministryRoles)
    .where(eq(schema.ministryRoles.id, fixture.ministryRoleId));
  await database
    .delete(schema.ministries)
    .where(eq(schema.ministries.id, fixture.ministryId));
  await database
    .delete(schema.services)
    .where(eq(schema.services.id, fixture.serviceId));
  await database
    .delete(schema.churches)
    .where(eq(schema.churches.id, fixture.churchId));
}
