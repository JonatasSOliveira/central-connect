import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { ListMembersOutput } from "../../dtos/member/ListMembersDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListMembers extends BaseUseCase<undefined, ListMembersOutput> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
  ) {
    super();
  }

  async execute(): Promise<Result<ListMembersOutput>> {
    try {
      const members = await this.memberRepository.findAll();

      const membersWithBasicInfo = members.map((member) => ({
        id: member.id,
        email: member.email,
        fullName: member.fullName,
        phone: member.phone,
        status: member.status,
        avatarUrl: member.avatarUrl,
      }));

      return {
        ok: true,
        value: {
          members: membersWithBasicInfo,
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
