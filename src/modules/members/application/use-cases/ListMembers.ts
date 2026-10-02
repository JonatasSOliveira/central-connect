import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import type {
  ListMembersInput,
  ListMembersOutput,
} from "../dtos/member/ListMembersDTO";

export type { ListMembersOutput } from "../dtos/member/ListMembersDTO";

import { BaseUseCase } from "../BaseUseCase";

export class ListMembers extends BaseUseCase<
  ListMembersInput,
  ListMembersOutput
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberMinistryRoleRepository: IMemberMinistryRoleRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(input: ListMembersInput): Promise<Result<ListMembersOutput>> {
    try {
      let memberChurches = await this.memberChurchRepository.findByChurchId(
        input.churchId,
      );

      if (input.ministryId) {
        const memberMinistries =
          await this.memberMinistryRepository.findByMinistryId(
            input.ministryId,
          );
        const memberIdsWithMinistry = new Set(
          memberMinistries.map((mm) => mm.memberId),
        );
        memberChurches = memberChurches.filter((mc) =>
          memberIdsWithMinistry.has(mc.memberId),
        );
      }

      if (memberChurches.length === 0) {
        return {
          ok: true,
          value: { members: [] },
        };
      }

      const memberIds = memberChurches.map((mc) => mc.memberId);
      const members = await this.memberRepository.findByIds(memberIds);

      const sortedMembers = members.sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "pt-BR", { sensitivity: "base" }),
      );

      const roleInfoByMember = new Map<string, { ministryRoleId: string; roleName: string }[]>();
      if (input.ministryId) {
        const [assignments, roles] = await Promise.all([
          this.memberMinistryRoleRepository.findByChurchIdAndMinistryId(
            input.churchId,
            input.ministryId,
          ),
          this.ministryRoleRepository.findByMinistryId(input.ministryId),
        ]);
        const roleNames = new Map(roles.map((role) => [role.id, role.name]));
        for (const assignment of assignments) {
          const roleName = roleNames.get(assignment.ministryRoleId);
          if (!roleName) continue;
          const current = roleInfoByMember.get(assignment.memberId) ?? [];
          current.push({ ministryRoleId: assignment.ministryRoleId, roleName });
          roleInfoByMember.set(assignment.memberId, current);
        }
      }

      const memberListItems = sortedMembers.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        churches: [
          {
            churchId: input.churchId,
            churchName: input.churchName ?? "Igreja",
          },
        ],
        ...(input.ministryId
          ? { ministryRoles: roleInfoByMember.get(member.id) ?? [] }
          : {}),
      }));

      return {
        ok: true,
        value: { members: memberListItems },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "LIST_MEMBERS_FAILED",
          message: "Falha ao listar membros",
        },
      };
    }
  }
}
