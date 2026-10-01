import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import { MemberChurch } from "@/modules/members/domain/entities/MemberChurch";
import { MemberMinistry } from "@/modules/members/domain/entities/MemberMinistry";
import type { MemberMinistry as MemberMinistryEntity } from "@/modules/members/domain/entities/MemberMinistry";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "../../dtos/member/CreateMemberDTO";

type Dependencies = {
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberMinistryRoleRepository: IMemberMinistryRoleRepository;
};

type SyncResult = { ok: true } | { ok: false; code: string; message: string };

async function removeMinistryRelations(
  dependencies: Dependencies,
  memberId: string,
  ministry: MemberMinistryEntity,
) {
  await dependencies.memberMinistryRepository.delete(ministry.id);
  const roles =
    await dependencies.memberMinistryRoleRepository.findByChurchMemberAndMinistry(
      ministry.churchId,
      memberId,
      ministry.ministryId,
    );
  for (const role of roles) {
    await dependencies.memberMinistryRoleRepository.delete(role.id);
  }
}

async function syncChurches(
  dependencies: Dependencies,
  memberId: string,
  churches: CreateMemberInput["churches"],
) {
  const existingChurches =
    await dependencies.memberChurchRepository.findByMemberId(memberId);
  const requestedChurchIds = new Set(churches.map((church) => church.churchId));
  for (const church of existingChurches) {
    if (!requestedChurchIds.has(church.churchId)) {
      await dependencies.memberChurchRepository.delete(church.id);
    }
  }

  const existingMinistries =
    await dependencies.memberMinistryRepository.findByMemberId(memberId);
  const requestedMinistryKeys = new Set(
    churches.flatMap((church) =>
      church.ministryIds.map(
        (ministryId) => `${church.churchId}:${ministryId}`,
      ),
    ),
  );
  for (const ministry of existingMinistries) {
    const key = `${ministry.churchId}:${ministry.ministryId}`;
    if (!requestedMinistryKeys.has(key)) {
      await removeMinistryRelations(dependencies, memberId, ministry);
    }
  }

  for (const church of churches) {
    await dependencies.memberChurchRepository.upsert(
      new MemberChurch({
        memberId,
        churchId: church.churchId,
        roleId: church.roleId,
      }),
    );
    for (const ministryId of church.ministryIds) {
      await dependencies.memberMinistryRepository.upsert(
        new MemberMinistry({ memberId, churchId: church.churchId, ministryId }),
      );
    }
  }
}

async function syncMinistryAssignments(
  dependencies: Dependencies,
  memberId: string,
  assignments: NonNullable<UpdateMemberInput["ministryAssignments"]>,
): Promise<SyncResult> {
  const memberChurches =
    await dependencies.memberChurchRepository.findByMemberId(memberId);
  const churchIds = new Set(memberChurches.map((church) => church.churchId));
  if (assignments.some((assignment) => !churchIds.has(assignment.churchId))) {
    return {
      ok: false,
      code: "MEMBER_CHURCH_NOT_FOUND",
      message: "Membro nao pertence a esta igreja",
    };
  }

  const assignmentChurchIds = new Set(
    assignments.map((assignment) => assignment.churchId),
  );
  const requestedKeys = new Set(
    assignments.flatMap((assignment) =>
      assignment.ministryIds.map(
        (ministryId) => `${assignment.churchId}:${ministryId}`,
      ),
    ),
  );
  const current =
    await dependencies.memberMinistryRepository.findByMemberId(memberId);
  for (const ministry of current) {
    const key = `${ministry.churchId}:${ministry.ministryId}`;
    if (assignmentChurchIds.has(ministry.churchId) && !requestedKeys.has(key)) {
      await removeMinistryRelations(dependencies, memberId, ministry);
    }
  }

  for (const assignment of assignments) {
    for (const ministryId of assignment.ministryIds) {
      await dependencies.memberMinistryRepository.upsert(
        new MemberMinistry({
          memberId,
          churchId: assignment.churchId,
          ministryId,
        }),
      );
    }
  }
  return { ok: true };
}

export async function syncMemberRelations(
  dependencies: Dependencies,
  memberId: string,
  input: Pick<UpdateMemberInput, "churches" | "ministryAssignments">,
): Promise<SyncResult> {
  if (input.churches) {
    await syncChurches(dependencies, memberId, input.churches);
  }
  if (input.ministryAssignments) {
    return syncMinistryAssignments(
      dependencies,
      memberId,
      input.ministryAssignments,
    );
  }
  return { ok: true };
}
