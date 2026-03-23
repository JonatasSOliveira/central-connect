import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { GetMemberOutput } from "../../dtos/member/GetMemberDTO";
import { BaseUseCase } from "../BaseUseCase";

export class GetMember extends BaseUseCase<string, GetMemberOutput> {
  constructor(private readonly memberRepository: IMemberRepository) {
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

      return {
        ok: true,
        value: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          status: member.status,
          avatarUrl: member.avatarUrl,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
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
