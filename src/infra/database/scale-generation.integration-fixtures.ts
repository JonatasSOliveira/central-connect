import { randomUUID } from "node:crypto";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import * as schema from "@/infra/database/drizzle/schema";

export type ScaleGenerationFixture = {
  churchId: string;
  otherChurchId: string;
  serviceId: string;
  conflictingServiceId: string;
  ministryId: string;
  secondMinistryId: string;
  roleId: string;
  secondRoleId: string;
  eligibleMemberId: string;
  unavailableMemberId: string;
  versatileMemberId: string;
  conflictScaleId: string;
  userId: string;
};

export async function createScaleGenerationFixture(
  database: DatabaseClient,
): Promise<ScaleGenerationFixture> {
  const fixture = {
    churchId: randomUUID(),
    otherChurchId: randomUUID(),
    serviceId: randomUUID(),
    conflictingServiceId: randomUUID(),
    ministryId: randomUUID(),
    secondMinistryId: randomUUID(),
    roleId: randomUUID(),
    secondRoleId: randomUUID(),
    eligibleMemberId: randomUUID(),
    unavailableMemberId: randomUUID(),
    versatileMemberId: randomUUID(),
    conflictScaleId: randomUUID(),
    userId: randomUUID(),
  };
  await database.insert(schema.churches).values([
    { id: fixture.churchId, name: `Generation Church ${fixture.churchId}` },
    { id: fixture.otherChurchId, name: `Other Church ${fixture.otherChurchId}` },
  ]);
  await database.insert(schema.users).values({
    id: fixture.userId,
    firebaseUid: `generation-${fixture.userId}`,
    isActive: true,
    isSuperAdmin: true,
  });
  await database.insert(schema.services).values([
    {
      id: fixture.serviceId,
      churchId: fixture.churchId,
      title: "Culto de Integração",
      dayOfWeek: "Sunday",
      time: "19:00",
      date: new Date("2035-10-07"),
    },
    {
      id: fixture.conflictingServiceId,
      churchId: fixture.churchId,
      title: "Culto no Mesmo Horário",
      dayOfWeek: "Sunday",
      time: "19:00",
      date: new Date("2035-10-07"),
    },
  ]);
  await database.insert(schema.ministries).values([
    {
      id: fixture.ministryId,
      churchId: fixture.churchId,
      name: `Louvor ${fixture.ministryId}`,
    },
    {
      id: fixture.secondMinistryId,
      churchId: fixture.churchId,
      name: `Recepção ${fixture.secondMinistryId}`,
    },
  ]);
  await database.insert(schema.ministryRoles).values([
    {
      id: fixture.roleId,
      ministryId: fixture.ministryId,
      name: "Voz principal",
      requiredCount: 1,
      displayOrder: 1,
    },
    {
      id: fixture.secondRoleId,
      ministryId: fixture.secondMinistryId,
      name: "Acolhimento",
      requiredCount: 1,
      displayOrder: 1,
    },
  ]);
  const members = [
    [fixture.eligibleMemberId, "Ana Integração"],
    [fixture.unavailableMemberId, "Bruno Indisponível"],
    [fixture.versatileMemberId, "Carla Versátil"],
  ] as const;
  await database.insert(schema.members).values(
    members.map(([id, fullName]) => ({
      id,
      fullName,
      email: `${id}@integration.example`,
      status: "Active",
    })),
  );
  await database.insert(schema.memberChurches).values(
    members.map(([memberId]) => ({ memberId, churchId: fixture.churchId })),
  );
  await database.insert(schema.memberMinistries).values([
    {
      memberId: fixture.eligibleMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
    },
    {
      memberId: fixture.unavailableMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
    },
    {
      memberId: fixture.versatileMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
    },
    {
      memberId: fixture.versatileMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.secondMinistryId,
    },
  ]);
  await database.insert(schema.memberMinistryRoles).values([
    {
      memberId: fixture.eligibleMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
      ministryRoleId: fixture.roleId,
    },
    {
      memberId: fixture.unavailableMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
      ministryRoleId: fixture.roleId,
    },
    {
      memberId: fixture.versatileMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.ministryId,
      ministryRoleId: fixture.roleId,
    },
    {
      memberId: fixture.versatileMemberId,
      churchId: fixture.churchId,
      ministryId: fixture.secondMinistryId,
      ministryRoleId: fixture.secondRoleId,
    },
  ]);
  await database.insert(schema.memberAvailabilities).values([
    { memberId: fixture.eligibleMemberId, daysOfWeek: ["Sunday"] },
    { memberId: fixture.unavailableMemberId, daysOfWeek: ["Monday"] },
    { memberId: fixture.versatileMemberId, daysOfWeek: ["Sunday"] },
  ]);
  await database.insert(schema.scales).values({
    id: fixture.conflictScaleId,
    serviceId: fixture.conflictingServiceId,
    ministryId: fixture.ministryId,
    status: "draft",
  });
  await database.insert(schema.scaleMembers).values({
    scaleId: fixture.conflictScaleId,
    memberId: fixture.eligibleMemberId,
    ministryRoleId: fixture.roleId,
  });
  return fixture;
}
