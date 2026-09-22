import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { MemberErrors } from "../errors/MemberErrors";

export interface DeleteMemberInput {
  memberId: string;
  churchId?: string | null;
  isSuperAdmin?: boolean;
}

export class DeleteMember extends BaseUseCase<DeleteMemberInput, void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
  ) {
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

      if (!input.isSuperAdmin) {
        if (!input.churchId) {
          return { ok: false, error: MemberErrors.MEMBER_NOT_IN_CHURCH };
        }
        const membership =
          await this.memberChurchRepository.findByMemberIdAndChurchId(
            input.memberId,
            input.churchId,
          );
        if (!membership) {
          return { ok: false, error: MemberErrors.MEMBER_NOT_IN_CHURCH };
        }
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
