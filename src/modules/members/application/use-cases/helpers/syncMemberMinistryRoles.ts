import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import { MemberMinistryRole } from "@/modules/members/domain/entities/MemberMinistryRole";

export type MemberMinistryRoleAssignment = {
  churchId: string;
  memberId: string;
  ministryId: string;
  ministryRoleIds: string[];
};

export async function syncMemberMinistryRoles(
  repositories: {
    memberMinistryRepository: IMemberMinistryRepository;
    memberMinistryRoleRepository: IMemberMinistryRoleRepository;
    ministryRoleRepository: IMinistryRoleRepository;
  },
  assignment: MemberMinistryRoleAssignment,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const uniqueRoleIds = [...new Set(assignment.ministryRoleIds)];
  const memberMinistry =
    await repositories.memberMinistryRepository.findByMemberAndMinistry(
      assignment.memberId,
      assignment.ministryId,
    );

  if (!memberMinistry || memberMinistry.churchId !== assignment.churchId) {
    return {
      ok: false,
      code: "MEMBER_MINISTRY_NOT_FOUND",
      message: "O membro não pertence a este ministério",
    };
  }

  const roles = await Promise.all(
    uniqueRoleIds.map((roleId) =>
      repositories.ministryRoleRepository.findById(roleId),
    ),
  );

  if (
    roles.some((role) => !role || role.ministryId !== assignment.ministryId)
  ) {
    return {
      ok: false,
      code: "MINISTRY_ROLE_NOT_FOUND",
      message: "Uma ou mais funções não pertencem a este ministério",
    };
  }

  const existing =
    await repositories.memberMinistryRoleRepository.findByChurchMemberAndMinistry(
      assignment.churchId,
      assignment.memberId,
      assignment.ministryId,
    );
  const requested = new Set(uniqueRoleIds);

  for (const current of existing) {
    if (!requested.has(current.ministryRoleId)) {
      await repositories.memberMinistryRoleRepository.delete(current.id);
    }
  }

  for (const ministryRoleId of uniqueRoleIds) {
    await repositories.memberMinistryRoleRepository.upsert(
      new MemberMinistryRole({
        churchId: assignment.churchId,
        memberId: assignment.memberId,
        ministryId: assignment.ministryId,
        ministryRoleId,
      }),
    );
  }

  return { ok: true };
}
