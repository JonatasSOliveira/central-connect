import { NotificationErrors } from "@/application/errors/NotificationErrors";
import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import type { IPushNotificationService } from "@/domain/ports/IPushNotificationService";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export type ScaleNotificationTrigger =
  | "scale_published"
  | "member_added_in_published_scale";

export interface NotifyScaleMembersInput {
  churchId: string;
  scaleId: string;
  serviceId: string;
  memberIds: string[];
  trigger: ScaleNotificationTrigger;
}

export interface NotifyScaleMembersOutput {
  targetedMembers: number;
  successCount: number;
  failureCount: number;
}

export class NotifyScaleMembers extends BaseUseCase<
  NotifyScaleMembersInput,
  NotifyScaleMembersOutput
> {
  constructor(
    private readonly memberPushTokenRepository: IMemberPushTokenRepository,
    private readonly pushNotificationService: IPushNotificationService,
    private readonly serviceRepository: IServiceRepository,
  ) {
    super();
  }

  async execute(
    input: NotifyScaleMembersInput,
  ): Promise<Result<NotifyScaleMembersOutput>> {
    try {
      const targetMemberIds = Array.from(new Set(input.memberIds));

      if (targetMemberIds.length === 0) {
        return {
          ok: true,
          value: {
            targetedMembers: 0,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const service = await this.serviceRepository.findById(input.serviceId);
      const formattedDate = service
        ? new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }).format(service.date)
        : null;

      const title =
        input.trigger === "scale_published"
          ? "Escala publicada"
          : "Você foi escalado";

      const bodyBase = service?.title ? `Culto ${service.title}` : "Nova escala";
      const bodyDate = formattedDate && service?.time
        ? ` em ${formattedDate} às ${service.time}`
        : "";

      const tokens = await this.memberPushTokenRepository.findActiveByChurchAndMemberIds(
        input.churchId,
        targetMemberIds,
      );

      const uniqueTokens = Array.from(new Set(tokens.map((item) => item.token)));

      if (uniqueTokens.length === 0) {
        return {
          ok: true,
          value: {
            targetedMembers: targetMemberIds.length,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const sendResult = await this.pushNotificationService.sendMulticast({
        tokens: uniqueTokens,
        payload: {
          title,
          body: `${bodyBase}${bodyDate}`,
          link: `/home?scaleId=${input.scaleId}&serviceId=${input.serviceId}`,
          data: {
            type: "scale_notification",
            scaleId: input.scaleId,
            serviceId: input.serviceId,
            trigger: input.trigger,
          },
        },
      });

      for (const invalidToken of sendResult.invalidTokens) {
        await this.memberPushTokenRepository.deactivateByToken(invalidToken);
      }

      const invalidTokenSet = new Set(sendResult.invalidTokens);
      const transientFailedTokens = sendResult.failedTokens.filter(
        (token) => !invalidTokenSet.has(token),
      );

      for (const failedToken of transientFailedTokens) {
        await this.memberPushTokenRepository.incrementFailureByToken(failedToken);
      }

      return {
        ok: true,
        value: {
          targetedMembers: targetMemberIds.length,
          successCount: sendResult.successCount,
          failureCount: sendResult.failureCount,
        },
      };
    } catch {
      return {
        ok: false,
        error: NotificationErrors.PUSH_NOTIFY_FAILED,
      };
    }
  }
}
