import type { DayOfWeek } from "@/domain/entities";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberAvailabilityRepository } from "@/domain/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";

type AutoAssignDeps = {
  churchRepository: IChurchRepository;
  memberAvailabilityRepository: IMemberAvailabilityRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberRepository: IMemberRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  scaleMemberRepository: IScaleMemberRepository;
  scaleRepository: IScaleRepository;
  serviceRepository: IServiceRepository;
};

type AutoAssignInput = {
  churchId: string;
  ministryId: string;
  serviceId: string;
};

type AutoAssignedScaleMember = {
  memberId: string;
  ministryRoleId: string;
  notes: string | null;
};

function toServiceSortKey(date: Date, time: string): string {
  const isoDate = date.toISOString().slice(0, 10);
  return `${isoDate}T${time || "00:00"}`;
}

function isAvailableForDay(
  dayOfWeek: DayOfWeek,
  availability:
    | {
        mode: "ALLOW_LIST" | "BLOCK_LIST";
        daysOfWeek: DayOfWeek[];
      }
    | undefined,
): boolean {
  if (!availability) {
    return true;
  }

  const containsDay = availability.daysOfWeek.includes(dayOfWeek);

  if (availability.mode === "ALLOW_LIST") {
    return containsDay;
  }

  return !containsDay;
}

export async function autoAssignScaleMembers(
  deps: AutoAssignDeps,
  input: AutoAssignInput,
): Promise<AutoAssignedScaleMember[]> {
  const [church, service, roles, memberChurches, memberMinistries, availabilities] =
    await Promise.all([
      deps.churchRepository.findById(input.churchId),
      deps.serviceRepository.findById(input.serviceId),
      deps.ministryRoleRepository.findByMinistryId(input.ministryId),
      deps.memberChurchRepository.findByChurchId(input.churchId),
      deps.memberMinistryRepository.findByMinistryId(input.ministryId),
      deps.memberAvailabilityRepository.findByChurchId(input.churchId),
    ]);

  if (!service || service.churchId !== input.churchId || roles.length === 0) {
    return [];
  }

  const maxConsecutiveScales =
    church?.maxConsecutiveScalesPerMember ??
    DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER;

  const memberIdsInChurch = new Set(memberChurches.map((item) => item.memberId));
  const memberIdsInMinistry = new Set(
    memberMinistries.map((item) => item.memberId),
  );

  const candidateIds = [...memberIdsInMinistry].filter((memberId) =>
    memberIdsInChurch.has(memberId),
  );

  if (candidateIds.length === 0) {
    return [];
  }

  const [candidates, churchServices, scales] = await Promise.all([
    deps.memberRepository.findByIds(candidateIds),
    deps.serviceRepository.findByChurchId(input.churchId),
    deps.scaleRepository.findByChurchId(input.churchId),
  ]);

  const activeCandidates = candidates.filter((member) => member.status === "Active");
  if (activeCandidates.length === 0) {
    return [];
  }

  const availabilityByMemberId = new Map(
    availabilities.map((availability) => [availability.memberId, availability]),
  );

  const scaleIds = scales.map((scale) => scale.id);
  const scaleMembers =
    scaleIds.length > 0 ? await deps.scaleMemberRepository.findByScaleIds(scaleIds) : [];

  const serviceById = new Map(churchServices.map((churchService) => [churchService.id, churchService]));
  const scaleById = new Map(scales.map((scale) => [scale.id, scale]));

  const memberIdsByServiceId = new Map<string, Set<string>>();

  for (const scaleMember of scaleMembers) {
    const scale = scaleById.get(scaleMember.scaleId);
    if (!scale) {
      continue;
    }

    if (!serviceById.has(scale.serviceId)) {
      continue;
    }

    const assignedMembers = memberIdsByServiceId.get(scale.serviceId) ?? new Set<string>();
    assignedMembers.add(scaleMember.memberId);
    memberIdsByServiceId.set(scale.serviceId, assignedMembers);
  }

  const currentServiceKey = toServiceSortKey(service.date, service.time);

  const previousServices = churchServices
    .filter((churchService) => churchService.id !== service.id)
    .filter((churchService) => toServiceSortKey(churchService.date, churchService.time) < currentServiceKey)
    .sort((a, b) =>
      toServiceSortKey(b.date, b.time).localeCompare(toServiceSortKey(a.date, a.time)),
    );

  const memberStreak = new Map<string, number>();
  const memberLastAssignedAt = new Map<string, string | null>();

  for (const member of activeCandidates) {
    let streak = 0;
    let lastAssignedAt: string | null = null;

    for (const previousService of previousServices) {
      const assignedMembers = memberIdsByServiceId.get(previousService.id);
      const isAssigned = assignedMembers?.has(member.id) ?? false;

      if (!isAssigned) {
        break;
      }

      const serviceKey = toServiceSortKey(previousService.date, previousService.time);
      if (!lastAssignedAt) {
        lastAssignedAt = serviceKey;
      }
      streak += 1;
    }

    memberStreak.set(member.id, streak);
    memberLastAssignedAt.set(member.id, lastAssignedAt);
  }

  const alreadyAssignedMemberIds = new Set<string>();
  const assignments: AutoAssignedScaleMember[] = [];

  const orderedRoles = [...roles].sort((a, b) => b.requiredCount - a.requiredCount);

  for (const role of orderedRoles) {
    for (let index = 0; index < role.requiredCount; index += 1) {
      const eligibleCandidates = activeCandidates
        .filter((member) => !alreadyAssignedMemberIds.has(member.id))
        .filter((member) => {
          const availability = availabilityByMemberId.get(member.id);
          return isAvailableForDay(service.dayOfWeek, availability);
        })
        .filter((member) => (memberStreak.get(member.id) ?? 0) < maxConsecutiveScales)
        .sort((a, b) => {
          const streakDiff = (memberStreak.get(a.id) ?? 0) - (memberStreak.get(b.id) ?? 0);
          if (streakDiff !== 0) {
            return streakDiff;
          }

          const aLastAssignedAt = memberLastAssignedAt.get(a.id) ?? "";
          const bLastAssignedAt = memberLastAssignedAt.get(b.id) ?? "";

          if (aLastAssignedAt !== bLastAssignedAt) {
            return aLastAssignedAt.localeCompare(bLastAssignedAt);
          }

          return a.fullName.localeCompare(b.fullName, "pt-BR", {
            sensitivity: "base",
          });
        });

      const selected = eligibleCandidates[0];
      if (!selected) {
        break;
      }

      alreadyAssignedMemberIds.add(selected.id);
      assignments.push({
        memberId: selected.id,
        ministryRoleId: role.id,
        notes: null,
      });
    }
  }

  return assignments;
}
