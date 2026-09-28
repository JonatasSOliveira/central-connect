import type { DeactivateMemberPushToken } from "@/modules/notifications/application/use-cases/DeactivateMemberPushToken";
import type { UpsertMemberPushToken } from "@/modules/notifications/application/use-cases/UpsertMemberPushToken";

export interface NotificationHandlerDependencies {
  upsertMemberPushToken: Pick<UpsertMemberPushToken, "execute">;
  deactivateMemberPushToken: Pick<DeactivateMemberPushToken, "execute">;
}
