import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import { MemberErrors } from "../../errors/MemberErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeleteMemberInput {
  memberId: string;
}

export class DeleteMember extends BaseUseCase<DeleteMemberInput, void> {
  constructor(private readonly memberRepository: IMemberRepository) {
    super();
  }

  async execute(input: DeleteMemberInput): Promise<Result<void>> {
    try {
      const existingMember = await this.memberRepository.findById(
        input.memberId,
      );

      if (!existingMember) {
        return {
          ok: false,
          error: MemberErrors.MEMBER_NOT_FOUND,
        };
      }

      await this.memberRepository.delete(input.memberId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: MemberErrors.MEMBER_DELETION_FAILED,
      };
    }
  }
}
