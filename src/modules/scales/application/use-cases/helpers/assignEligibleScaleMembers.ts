import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

type Member = { id: string; fullName: string };
type Role = { id: string; requiredCount: number };
type Service = { id: string; date: Date; time: string; dayOfWeek: DayOfWeek };
type Scale = { id: string; serviceId: string };
type ScaleMember = { scaleId: string; memberId: string };
type Availability = { memberId: string; daysOfWeek: DayOfWeek[] };
type RoleAssignment = { memberId: string; ministryRoleId: string };

export type AutoAssignedScaleMember = {
  memberId: string;
  ministryRoleId: string;
  notes: string | null;
};

function serviceKey(service: Pick<Service, "date" | "time">): string {
  return `${service.date.toISOString().slice(0, 10)}T${service.time || "00:00"}`;
}

function isAvailable(
  dayOfWeek: DayOfWeek,
  availability: Availability | undefined,
): boolean {
  return !availability || availability.daysOfWeek.includes(dayOfWeek);
}

export function assignEligibleScaleMembers(input: {
  roles: Role[];
  members: Member[];
  service: Service;
  services: Service[];
  scales: Scale[];
  scaleMembers: ScaleMember[];
  availabilities: Availability[];
  roleAssignments: RoleAssignment[];
  maxConsecutiveScales: number;
}): AutoAssignedScaleMember[] {
  const availabilityByMember = new Map(
    input.availabilities.map((availability) => [
      availability.memberId,
      availability,
    ]),
  );
  const roleIdsByMember = new Map<string, Set<string>>();
  for (const assignment of input.roleAssignments) {
    const roleIds = roleIdsByMember.get(assignment.memberId) ?? new Set();
    roleIds.add(assignment.ministryRoleId);
    roleIdsByMember.set(assignment.memberId, roleIds);
  }

  const serviceById = new Map(
    input.services.map((service) => [service.id, service]),
  );
  const scaleById = new Map(input.scales.map((scale) => [scale.id, scale]));
  const memberIdsByService = new Map<string, Set<string>>();
  for (const scaleMember of input.scaleMembers) {
    const scale = scaleById.get(scaleMember.scaleId);
    if (!scale || !serviceById.has(scale.serviceId)) continue;
    const memberIds = memberIdsByService.get(scale.serviceId) ?? new Set();
    memberIds.add(scaleMember.memberId);
    memberIdsByService.set(scale.serviceId, memberIds);
  }

  const previousServices = input.services
    .filter((service) => service.id !== input.service.id)
    .filter((service) => serviceKey(service) < serviceKey(input.service))
    .sort((a, b) => serviceKey(b).localeCompare(serviceKey(a)));
  const streakByMember = new Map<string, number>();
  const lastAssignedByMember = new Map<string, string | null>();
  for (const member of input.members) {
    let streak = 0;
    let lastAssigned: string | null = null;
    for (const service of previousServices) {
      if (!memberIdsByService.get(service.id)?.has(member.id)) break;
      lastAssigned ??= serviceKey(service);
      streak += 1;
    }
    streakByMember.set(member.id, streak);
    lastAssignedByMember.set(member.id, lastAssigned);
  }

  const selectedMemberIds = new Set<string>();
  const assignments: AutoAssignedScaleMember[] = [];
  const orderedRoles = [...input.roles].sort(
    (a, b) => b.requiredCount - a.requiredCount,
  );
  for (const role of orderedRoles) {
    for (let index = 0; index < role.requiredCount; index += 1) {
      const candidates = input.members
        .filter((member) => !selectedMemberIds.has(member.id))
        .filter((member) => roleIdsByMember.get(member.id)?.has(role.id))
        .filter((member) =>
          isAvailable(
            input.service.dayOfWeek,
            availabilityByMember.get(member.id),
          ),
        )
        .filter(
          (member) =>
            (streakByMember.get(member.id) ?? 0) < input.maxConsecutiveScales,
        )
        .sort((a, b) => {
          const streakDiff =
            (streakByMember.get(a.id) ?? 0) - (streakByMember.get(b.id) ?? 0);
          if (streakDiff !== 0) return streakDiff;
          const lastA = lastAssignedByMember.get(a.id) ?? "";
          const lastB = lastAssignedByMember.get(b.id) ?? "";
          if (lastA !== lastB) return lastA.localeCompare(lastB);
          return a.fullName.localeCompare(b.fullName, "pt-BR", {
            sensitivity: "base",
          });
        });
      const selected = candidates[0];
      if (!selected) break;
      selectedMemberIds.add(selected.id);
      assignments.push({
        memberId: selected.id,
        ministryRoleId: role.id,
        notes: null,
      });
    }
  }
  return assignments;
}
