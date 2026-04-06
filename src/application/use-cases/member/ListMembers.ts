import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type {
  ListMembersInput,
  ListMembersOutput,
} from "../../dtos/member/ListMembersDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListMembers extends BaseUseCase<
  ListMembersInput,
  ListMembersOutput
> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly churchRepository: IChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
  ) {
    super();
  }

  async execute(input: ListMembersInput): Promise<Result<ListMembersOutput>> {
    try {
      const church = await this.churchRepository.findById(input.churchId);
      if (!church) {
        return {
          ok: true,
          value: { members: [] },
        };
      }

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
        churches: [{ churchId: church.id, churchName: church.name }],
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
