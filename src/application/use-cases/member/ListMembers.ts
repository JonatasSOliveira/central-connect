import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { ListMembersOutput } from "../../dtos/member/ListMembersDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListMembers extends BaseUseCase<undefined, ListMembersOutput> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly churchRepository: IChurchRepository,
  ) {
    super();
  }

  async execute(): Promise<Result<ListMembersOutput>> {
    try {
      const members = await this.memberRepository.findAll();

      const membersWithChurchInfo = await Promise.all(
        members.map(async (member) => {
          const memberChurches =
            await this.memberChurchRepository.findByMemberId(member.id);
          let churchName: string | null = null;

          if (memberChurches.length > 0) {
            const church = await this.churchRepository.findById(
              memberChurches[0].churchId,
            );
            if (church) {
              churchName = church.name;
            }
          }

          return {
            id: member.id,
            fullName: member.fullName,
            churchName,
          };
        }),
      );

      return {
        ok: true,
        value: {
          members: membersWithChurchInfo,
        },
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
