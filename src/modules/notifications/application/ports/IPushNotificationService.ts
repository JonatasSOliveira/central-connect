export interface PushNotificationPayload {
  title: string;
  body: string;
  link?: string;
  data?: Record<string, string>;
}

export interface PushMulticastInput {
  tokens: string[];
  payload: PushNotificationPayload;
}

export interface PushMulticastOutput {
  successCount: number;
  failureCount: number;
  failedTokens: string[];
  invalidTokens: string[];
}

export interface IPushNotificationService {
  sendMulticast(input: PushMulticastInput): Promise<PushMulticastOutput>;
}
