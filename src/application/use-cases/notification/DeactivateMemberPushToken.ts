import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import type { Result } from "@/shared/types/Result";
import { NotificationErrors } from "@/application/errors/NotificationErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeactivateMemberPushTokenInput {
  churchId: string;
  memberId: string;
  token: string;
}

export interface DeactivateMemberPushTokenOutput {
  success: boolean;
}

export class DeactivateMemberPushToken extends BaseUseCase<
  DeactivateMemberPushTokenInput,
  DeactivateMemberPushTokenOutput
> {
  constructor(
    private readonly memberPushTokenRepository: IMemberPushTokenRepository,
  ) {
    super();
  }

  async execute(
    input: DeactivateMemberPushTokenInput,
  ): Promise<Result<DeactivateMemberPushTokenOutput>> {
    try {
      await this.memberPushTokenRepository.deactivateByTokenForMember(
        input.churchId,
        input.memberId,
        input.token,
      );

      return {
        ok: true,
        value: { success: true },
      };
    } catch {
      return {
        ok: false,
        error: NotificationErrors.PUSH_TOKEN_DEACTIVATE_FAILED,
      };
    }
  }
}
