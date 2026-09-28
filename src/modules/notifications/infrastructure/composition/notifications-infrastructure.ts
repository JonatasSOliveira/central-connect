import { DeactivateMemberPushToken } from "@/modules/notifications/application/use-cases/DeactivateMemberPushToken";
import { NotifyPublishedScalesByDate } from "@/modules/notifications/application/use-cases/NotifyPublishedScalesByDate";
import { NotifyScaleMembers } from "@/modules/notifications/application/use-cases/NotifyScaleMembers";
import { UpsertMemberPushToken } from "@/modules/notifications/application/use-cases/UpsertMemberPushToken";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { MemberPushTokenDrizzleRepository } from "@/modules/notifications/infrastructure/persistence/drizzle/MemberPushTokenDrizzleRepository";
import { FirebasePushNotificationService } from "@/modules/notifications/infrastructure/services/FirebasePushNotificationService";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { ScaleMemberDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleMemberDrizzleRepository";
import { ServiceDrizzleRepository } from "@/modules/services/infrastructure/persistence/drizzle/ServiceDrizzleRepository";

export function createNotificationsInfrastructure() {
  const database = getDatabaseClient();
  const memberPushTokenRepository = new MemberPushTokenDrizzleRepository(
    database,
  );
  const pushNotificationService = new FirebasePushNotificationService();
  const serviceRepository = new ServiceDrizzleRepository(database);
  const scaleRepository = new ScaleDrizzleRepository(database);
  const scaleMemberRepository = new ScaleMemberDrizzleRepository(database);

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
