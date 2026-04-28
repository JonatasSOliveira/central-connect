import {
  MemberPushToken,
  type MemberPushTokenParams,
} from "@/domain/entities/MemberPushToken";
import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import type { Result } from "@/shared/types/Result";
import { NotificationErrors } from "@/application/errors/NotificationErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface UpsertMemberPushTokenInput {
  churchId: string;
  memberId: string;
  token: string;
  deviceId?: string;
  platform?: "web";
  userId: string;
}

export interface UpsertMemberPushTokenOutput {
  tokenId: string;
}

export class UpsertMemberPushToken extends BaseUseCase<
  UpsertMemberPushTokenInput,
  UpsertMemberPushTokenOutput
> {
  constructor(
    private readonly memberPushTokenRepository: IMemberPushTokenRepository,
  ) {
    super();
  }

  async execute(
    input: UpsertMemberPushTokenInput,
  ): Promise<Result<UpsertMemberPushTokenOutput>> {
    try {
      const existing = await this.memberPushTokenRepository.findByMemberAndToken(
        input.churchId,
        input.memberId,
        input.token,
      );

      if (existing) {
        const updateParams: MemberPushTokenParams = {
          id: existing.id,
          churchId: existing.churchId,
          memberId: existing.memberId,
          token: existing.token,
          deviceId: input.deviceId ?? existing.deviceId,
          platform: input.platform ?? existing.platform,
          isActive: true,
          failureCount: 0,
          lastSeenAt: new Date(),
          lastFailureAt: existing.lastFailureAt,
          createdAt: existing.createdAt,
          updatedAt: new Date(),
          createdByUserId: existing.createdByUserId,
          updatedByUserId: input.userId,
        };

        const updated = await this.memberPushTokenRepository.update(
          new MemberPushToken(updateParams),
        );

        return {
          ok: true,
          value: { tokenId: updated.id },
        };
      }

      const createParams: MemberPushTokenParams = {
        churchId: input.churchId,
        memberId: input.memberId,
        token: input.token,
        deviceId: input.deviceId ?? null,
        platform: input.platform ?? "web",
        isActive: true,
        failureCount: 0,
        lastSeenAt: new Date(),
        lastFailureAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: input.userId,
        updatedByUserId: input.userId,
      };

      const created = await this.memberPushTokenRepository.create(
        new MemberPushToken(createParams),
      );

      return {
        ok: true,
        value: { tokenId: created.id },
      };
    } catch {
      return {
        ok: false,
        error: NotificationErrors.PUSH_TOKEN_UPSERT_FAILED,
      };
    }
  }
}
