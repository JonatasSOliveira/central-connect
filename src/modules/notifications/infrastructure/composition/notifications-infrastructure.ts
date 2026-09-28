import { DeactivateMemberPushToken } from "@/modules/notifications/application/use-cases/DeactivateMemberPushToken";
import { NotifyPublishedScalesByDate } from "@/modules/notifications/application/use-cases/NotifyPublishedScalesByDate";
import { NotifyScaleMembers } from "@/modules/notifications/application/use-cases/NotifyScaleMembers";
import { UpsertMemberPushToken } from "@/modules/notifications/application/use-cases/UpsertMemberPushToken";
import type { IMemberPushTokenRepository } from "@/modules/notifications/application/ports/IMemberPushTokenRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import { FirebasePushNotificationService } from "@/modules/notifications/infrastructure/services/FirebasePushNotificationService";

export function createNotificationsInfrastructure(dependencies: {
  serviceRepository: IServiceRepository;
  scaleRepository: IScaleRepository;
  scaleMemberRepository: IScaleMemberRepository;
  memberPushTokenRepository: IMemberPushTokenRepository;
}) {
  const memberPushTokenRepository = dependencies.memberPushTokenRepository;
  const pushNotificationService = new FirebasePushNotificationService();

  return {
    memberPushTokenRepository,
    upsertMemberPushToken: new UpsertMemberPushToken(memberPushTokenRepository),
    deactivateMemberPushToken: new DeactivateMemberPushToken(
      memberPushTokenRepository,
    ),
    notifyScaleMembers: new NotifyScaleMembers(
      memberPushTokenRepository,
      pushNotificationService,
      dependencies.serviceRepository,
    ),
    notifyPublishedScalesByDate: new NotifyPublishedScalesByDate(
      dependencies.serviceRepository,
      dependencies.scaleRepository,
      dependencies.scaleMemberRepository,
      memberPushTokenRepository,
      pushNotificationService,
    ),
  };
}

export type NotificationsInfrastructure = ReturnType<
  typeof createNotificationsInfrastructure
>;
