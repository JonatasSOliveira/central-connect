import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";

export type ScaleContextInput = {
  churchId: string;
  serviceId: string;
  ministryId: string;
  members: { memberId: string; ministryRoleId: string }[];
};

export type ScaleContextDependencies = {
  churchRepository: IChurchRepository;
  serviceRepository: IServiceRepository;
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
};

export async function validateScaleContext(
  deps: ScaleContextDependencies,
  input: ScaleContextInput,
): Promise<string | null> {
  const [church, service, ministry, roles] = await Promise.all([
    deps.churchRepository.findById(input.churchId),
    deps.serviceRepository.findById(input.serviceId),
    deps.ministryRepository.findById(input.ministryId),
    deps.ministryRoleRepository.findByMinistryId(input.ministryId),
  ]);

  if (!church) return "CHURCH_NOT_FOUND";
  if (!service || service.churchId !== input.churchId) return "SERVICE_INVALID";
  if (!ministry || ministry.churchId !== input.churchId)
    return "MINISTRY_INVALID";

  const roleIds = new Set(roles.map((role) => role.id));
  const uniqueMemberIds = new Set<string>();
  const memberIds = input.members.map((member) => member.memberId);
  const members = await deps.memberRepository.findByIds(memberIds);

  if (members.length !== new Set(memberIds).size) return "MEMBER_NOT_FOUND";

  for (const member of input.members) {
    if (uniqueMemberIds.has(member.memberId)) return "DUPLICATE_SCALE_MEMBER";
    uniqueMemberIds.add(member.memberId);

    if (!roleIds.has(member.ministryRoleId)) return "MINISTRY_ROLE_INVALID";

    const [memberChurch, memberMinistry] = await Promise.all([
      deps.memberChurchRepository.findByMemberIdAndChurchId(
        member.memberId,
        input.churchId,
      ),
      deps.memberMinistryRepository.findByMemberAndMinistry(
        member.memberId,
        input.ministryId,
      ),
    ]);

    if (
      !memberChurch ||
      !memberMinistry ||
      memberMinistry.churchId !== input.churchId
    ) {
      return "MEMBER_CONTEXT_INVALID";
    }
  }

  return null;
}
