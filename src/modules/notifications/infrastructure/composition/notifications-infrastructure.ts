import { DeactivateMemberPushToken } from "@/modules/notifications/application/use-cases/DeactivateMemberPushToken";
import { NotifyPublishedScalesByDate } from "@/modules/notifications/application/use-cases/NotifyPublishedScalesByDate";
import { NotifyScaleMembers } from "@/modules/notifications/application/use-cases/NotifyScaleMembers";
import { UpsertMemberPushToken } from "@/modules/notifications/application/use-cases/UpsertMemberPushToken";
import { MemberPushTokenFirebaseRepository } from "@/modules/notifications/infrastructure/persistence/firebase/MemberPushTokenFirebaseRepository";
import { FirebasePushNotificationService } from "@/modules/notifications/infrastructure/services/FirebasePushNotificationService";
import { ScaleFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleFirebaseRepository";
import { ScaleMemberFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleMemberFirebaseRepository";
import { ServiceFirebaseRepository } from "@/modules/services/infrastructure/persistence/firebase/ServiceFirebaseRepository";

export function createNotificationsInfrastructure() {
  const memberPushTokenRepository = new MemberPushTokenFirebaseRepository();
  const pushNotificationService = new FirebasePushNotificationService();
  const serviceRepository = new ServiceFirebaseRepository();
  const scaleRepository = new ScaleFirebaseRepository();
  const scaleMemberRepository = new ScaleMemberFirebaseRepository();

  return {
    memberPushTokenRepository,
    upsertMemberPushToken: new UpsertMemberPushToken(memberPushTokenRepository),
    deactivateMemberPushToken: new DeactivateMemberPushToken(
      memberPushTokenRepository,
    ),
    notifyScaleMembers: new NotifyScaleMembers(
      memberPushTokenRepository,
      pushNotificationService,
      serviceRepository,
    ),
    notifyPublishedScalesByDate: new NotifyPublishedScalesByDate(
      serviceRepository,
      scaleRepository,
      scaleMemberRepository,
      memberPushTokenRepository,
      pushNotificationService,
    ),
  };
}

export type NotificationsInfrastructure = ReturnType<
  typeof createNotificationsInfrastructure
>;
