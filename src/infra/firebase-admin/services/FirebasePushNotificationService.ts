import { getMessaging } from "firebase-admin/messaging";
import type {
  IPushNotificationService,
  PushMulticastInput,
  PushMulticastOutput,
} from "@/domain/ports/IPushNotificationService";
import { getFirebaseApp } from "../firebaseConfig";

export class FirebasePushNotificationService implements IPushNotificationService {
  async sendMulticast(input: PushMulticastInput): Promise<PushMulticastOutput> {
    if (input.tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        failedTokens: [],
        invalidTokens: [],
      };
    }

    const response = await getMessaging(getFirebaseApp()).sendEachForMulticast({
      tokens: input.tokens,
      notification: {
        title: input.payload.title,
        body: input.payload.body,
      },
      data: input.payload.data,
      webpush: {
        notification: {
          title: input.payload.title,
          body: input.payload.body,
        },
        fcmOptions: {
          link: input.payload.link,
        },
      },
    });

    const invalidTokens: string[] = [];
    const failedTokens: string[] = [];

    response.responses.forEach((result, index) => {
      if (result.success) {
        return;
      }

      const code = result.error?.code;
      failedTokens.push(input.tokens[index]);

      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        invalidTokens.push(input.tokens[index]);
      }
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
      invalidTokens,
    };
  }
}
