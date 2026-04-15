import type {
  LookupSelfSignupMemberInputDTO,
  LookupSelfSignupMemberOutputDTO,
} from "@/application/dtos/self-signup/LookupSelfSignupMemberDTO";
import { SelfSignupErrors } from "@/application/errors/SelfSignupErrors";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import { normalizePhone } from "@/shared/utils/phone";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface LookupMemberByPhoneInput
  extends LookupSelfSignupMemberInputDTO {
  churchId: string;
}

export class LookupMemberByPhone extends BaseUseCase<
  LookupMemberByPhoneInput,
  LookupSelfSignupMemberOutputDTO
> {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly memberRepository: IMemberRepository,
  ) {
    super();
  }

  async execute(
    input: LookupMemberByPhoneInput,
  ): Promise<Result<LookupSelfSignupMemberOutputDTO>> {
    try {
      const church = await this.churchRepository.findById(input.churchId);
      if (!church) {
        return {
          ok: false,
          error: SelfSignupErrors.CHURCH_NOT_FOUND,
        };
      }

      const phoneNormalized = normalizePhone(input.phone);
      if (phoneNormalized.length < 8) {
        return {
          ok: false,
          error: SelfSignupErrors.INVALID_PHONE,
        };
      }

      const member =
        await this.memberRepository.findByNormalizedPhone(phoneNormalized);

      if (!member) {
        return {
          ok: true,
          value: {
            memberExists: false,
            prefill: null,
          },
        };
      }

      return {
        ok: true,
        value: {
          memberExists: true,
          prefill: {
            fullName: member.fullName,
            email: member.email,
            phone: member.phone,
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: SelfSignupErrors.LOOKUP_FAILED,
      };
    }
  }
}
