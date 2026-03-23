import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { GetMemberOutput } from "../../dtos/member/GetMemberDTO";
import { BaseUseCase } from "../BaseUseCase";

export class GetMember extends BaseUseCase<string, GetMemberOutput> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
  ) {
    super();
  }

  async execute(id: string): Promise<Result<GetMemberOutput>> {
    try {
      const member = await this.memberRepository.findById(id);

      if (!member) {
        return {
          ok: false,
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "Membro não encontrado",
          },
        };
      }

      const memberChurches =
        await this.memberChurchRepository.findByMemberId(id);
      const churchId =
        memberChurches.length > 0 ? memberChurches[0].churchId : null;

      return {
        ok: true,
        value: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          status: member.status,
          avatarUrl: member.avatarUrl,
          churchId,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GET_MEMBER_FAILED",
          message: "Falha ao buscar membro",
        },
      };
    }
  }
}
