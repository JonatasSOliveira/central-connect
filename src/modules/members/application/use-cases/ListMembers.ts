import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
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

      const memberListItems = sortedMembers.map((member) => ({
        id: member.id,
        fullName: member.fullName,
        churches: [
          {
            churchId: input.churchId,
            churchName: input.churchName ?? "Igreja",
          },
        ],
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
