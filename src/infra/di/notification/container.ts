import { DeactivateMemberPushToken } from "@/application/use-cases/notification/DeactivateMemberPushToken";
import { NotifyScaleMembers } from "@/application/use-cases/notification/NotifyScaleMembers";
import { UpsertMemberPushToken } from "@/application/use-cases/notification/UpsertMemberPushToken";
import type { IMemberPushTokenRepository } from "@/domain/ports/IMemberPushTokenRepository";
import type { IPushNotificationService } from "@/domain/ports/IPushNotificationService";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import { MemberPushTokenFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberPushTokenFirebaseRepository";
import { ServiceFirebaseRepository } from "@/infra/firebase-admin/repositories/ServiceFirebaseRepository";
import { FirebasePushNotificationService } from "@/infra/firebase-admin/services/FirebasePushNotificationService";

class NotificationContainer {
  private static _memberPushTokenRepository: IMemberPushTokenRepository | null =
    null;
  private static _pushNotificationService: IPushNotificationService | null = null;
  private static _serviceRepository: IServiceRepository | null = null;

  private static _upsertMemberPushToken: UpsertMemberPushToken | null = null;
  private static _deactivateMemberPushToken: DeactivateMemberPushToken | null =
    null;
  private static _notifyScaleMembers: NotifyScaleMembers | null = null;

  private constructor() {}

  static get memberPushTokenRepository(): IMemberPushTokenRepository {
    if (!NotificationContainer._memberPushTokenRepository) {
      NotificationContainer._memberPushTokenRepository =
        new MemberPushTokenFirebaseRepository();
    }

    return NotificationContainer._memberPushTokenRepository;
  }

  static get pushNotificationService(): IPushNotificationService {
    if (!NotificationContainer._pushNotificationService) {
      NotificationContainer._pushNotificationService =
        new FirebasePushNotificationService();
    }

    return NotificationContainer._pushNotificationService;
  }

  static get serviceRepository(): IServiceRepository {
    if (!NotificationContainer._serviceRepository) {
      NotificationContainer._serviceRepository = new ServiceFirebaseRepository();
    }

    return NotificationContainer._serviceRepository;
  }

  static get upsertMemberPushToken(): UpsertMemberPushToken {
    if (!NotificationContainer._upsertMemberPushToken) {
      NotificationContainer._upsertMemberPushToken = new UpsertMemberPushToken(
        NotificationContainer.memberPushTokenRepository,
      );
    }

    return NotificationContainer._upsertMemberPushToken;
  }

  static get deactivateMemberPushToken(): DeactivateMemberPushToken {
    if (!NotificationContainer._deactivateMemberPushToken) {
      NotificationContainer._deactivateMemberPushToken =
        new DeactivateMemberPushToken(
          NotificationContainer.memberPushTokenRepository,
        );
    }

    return NotificationContainer._deactivateMemberPushToken;
  }

  static get notifyScaleMembers(): NotifyScaleMembers {
    if (!NotificationContainer._notifyScaleMembers) {
      NotificationContainer._notifyScaleMembers = new NotifyScaleMembers(
        NotificationContainer.memberPushTokenRepository,
        NotificationContainer.pushNotificationService,
        NotificationContainer.serviceRepository,
      );
    }

    return NotificationContainer._notifyScaleMembers;
  }
}

export const notificationContainer = NotificationContainer;
