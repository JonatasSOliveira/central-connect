import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import { DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER } from "@/shared/constants/scaleRules";
import { assignEligibleScaleMembers } from "./helpers/assignEligibleScaleMembers";

type AutoAssignDeps = {
  churchRepository: IChurchRepository;
  memberAvailabilityRepository: IMemberAvailabilityRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberMinistryRoleRepository: IMemberMinistryRoleRepository;
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

export async function autoAssignScaleMembers(
  deps: AutoAssignDeps,
  input: AutoAssignInput,
): Promise<ReturnType<typeof assignEligibleScaleMembers>> {
  const [
    church,
    service,
    roles,
    memberChurches,
    memberMinistries,
    roleAssignments,
  ] = await Promise.all([
    deps.churchRepository.findById(input.churchId),
    deps.serviceRepository.findById(input.serviceId),
    deps.ministryRoleRepository.findByMinistryId(input.ministryId),
    deps.memberChurchRepository.findByChurchId(input.churchId),
    deps.memberMinistryRepository.findByMinistryId(input.ministryId),
    deps.memberMinistryRoleRepository.findByMinistryId(input.ministryId),
  ]);

  if (!service || service.churchId !== input.churchId || roles.length === 0) {
    return [];
  }

  const maxConsecutiveScales =
    church?.maxConsecutiveScalesPerMember ??
    DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER;

  const memberIdsInChurch = new Set(
    memberChurches.map((item) => item.memberId),
  );
  const memberIdsInMinistry = new Set(
    memberMinistries.map((item) => item.memberId),
  );

  const candidateIds = [...memberIdsInMinistry].filter((memberId) =>
    memberIdsInChurch.has(memberId),
  );

  if (candidateIds.length === 0) {
    return [];
  }

  const availabilities =
    await deps.memberAvailabilityRepository.findByMemberIds(candidateIds);

  const [candidates, churchServices, scales] = await Promise.all([
    deps.memberRepository.findByIds(candidateIds),
    deps.serviceRepository.findByChurchId(input.churchId),
    deps.scaleRepository.findByChurchId(input.churchId),
  ]);

  const activeCandidates = candidates.filter(
    (member) => member.status === "Active",
  );
  if (activeCandidates.length === 0) {
    return [];
  }

  const scaleIds = scales.map((scale) => scale.id);
  const scaleMembers =
    scaleIds.length > 0
      ? await deps.scaleMemberRepository.findByScaleIds(scaleIds)
      : [];

  return assignEligibleScaleMembers({
    roles,
    members: activeCandidates,
    service,
    services: churchServices,
    scales,
    scaleMembers,
    availabilities,
    roleAssignments,
    maxConsecutiveScales,
  });
}
