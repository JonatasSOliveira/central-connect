import type { NotificationsInfrastructure } from "@/modules/notifications/infrastructure/composition/notifications-infrastructure";
import { createPushTokenHandlers } from "@/modules/notifications/presentation/http/handlers/push-token-handlers";

export function createNotificationsComposition(
  infrastructure: NotificationsInfrastructure,
) {

  return {
    dependencies: infrastructure,
    httpHandlers: {
      pushTokens: createPushTokenHandlers(infrastructure),
    },
  };
}

export type NotificationsComposition = ReturnType<
  typeof createNotificationsComposition
>;
