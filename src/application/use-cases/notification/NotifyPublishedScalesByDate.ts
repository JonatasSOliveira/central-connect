import { NotificationErrors } from "@/application/errors/NotificationErrors";
import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import type { IPushNotificationService } from "@/domain/ports/IPushNotificationService";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface NotifyPublishedScalesByDateInput {
  churchId: string;
  date: string;
}

export interface NotifyPublishedScalesByDateOutput {
  date: string;
  serviceCount: number;
  scaleCount: number;
  targetedMembers: number;
  successCount: number;
  failureCount: number;
}

function toDateRange(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000`);
  const end = new Date(`${date}T23:59:59.999`);
  return { start, end };
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export class NotifyPublishedScalesByDate extends BaseUseCase<
  NotifyPublishedScalesByDateInput,
  NotifyPublishedScalesByDateOutput
> {
  constructor(
    private readonly serviceRepository: IServiceRepository,
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly memberPushTokenRepository: IMemberPushTokenRepository,
    private readonly pushNotificationService: IPushNotificationService,
  ) {
    super();
  }

  async execute(
    input: NotifyPublishedScalesByDateInput,
  ): Promise<Result<NotifyPublishedScalesByDateOutput>> {
    try {
      const { start, end } = toDateRange(input.date);
      const services = await this.serviceRepository.findByDateRange(
        input.churchId,
        start,
        end,
      );

      if (services.length === 0) {
        return {
          ok: true,
          value: {
            date: input.date,
            serviceCount: 0,
            scaleCount: 0,
            targetedMembers: 0,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const serviceIds = new Set(services.map((service) => service.id));
      const scales = await this.scaleRepository.findByChurchId(input.churchId);
      const publishedScales = scales.filter(
        (scale) =>
          scale.status === "published" && serviceIds.has(scale.serviceId),
      );

      if (publishedScales.length === 0) {
        return {
          ok: true,
          value: {
            date: input.date,
            serviceCount: services.length,
            scaleCount: 0,
            targetedMembers: 0,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const scaleIds = publishedScales.map((scale) => scale.id);
      const scaleMembers = await this.scaleMemberRepository.findByScaleIds(scaleIds);
      const targetMemberIds = Array.from(
        new Set(scaleMembers.map((member) => member.memberId)),
      );

      if (targetMemberIds.length === 0) {
        return {
          ok: true,
          value: {
            date: input.date,
            serviceCount: services.length,
            scaleCount: publishedScales.length,
            targetedMembers: 0,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const tokens = await this.memberPushTokenRepository.findActiveByChurchAndMemberIds(
        input.churchId,
        targetMemberIds,
      );
      const uniqueTokens = Array.from(new Set(tokens.map((item) => item.token)));

      if (uniqueTokens.length === 0) {
        return {
          ok: true,
          value: {
            date: input.date,
            serviceCount: services.length,
            scaleCount: publishedScales.length,
            targetedMembers: targetMemberIds.length,
            successCount: 0,
            failureCount: 0,
          },
        };
      }

      const dateLabel = formatDate(input.date);
      const sendResult = await this.pushNotificationService.sendMulticast({
        tokens: uniqueTokens,
        payload: {
          title: "Escalas confirmadas para hoje",
          body: `As escalas publicadas para ${dateLabel} já estão disponíveis. Toque para visualizar.`,
          link: "/my-scales",
          data: {
            type: "scale_notification",
            trigger: "scale_manual_broadcast",
            date: input.date,
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
          date: input.date,
          serviceCount: services.length,
          scaleCount: publishedScales.length,
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
