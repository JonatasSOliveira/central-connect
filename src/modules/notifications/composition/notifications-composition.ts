import { createNotificationsInfrastructure } from "@/modules/notifications/infrastructure/composition/notifications-infrastructure";
import { createPushTokenHandlers } from "@/modules/notifications/presentation/http/handlers/push-token-handlers";

export function createNotificationsComposition() {
  const dependencies = createNotificationsInfrastructure();

  return {
    dependencies,
    httpHandlers: {
      pushTokens: createPushTokenHandlers(dependencies),
    },
  };
}

export type NotificationsComposition = ReturnType<
  typeof createNotificationsComposition
>;
