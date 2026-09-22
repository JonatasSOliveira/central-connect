export type ScaleNotificationResult =
  | {
      ok: true;
      value: {
        date: string;
        serviceCount: number;
        scaleCount: number;
        targetedMembers: number;
        successCount: number;
        failureCount: number;
      };
    }
  | {
      ok: false;
      error: { code: string; message: string };
    };

export interface IScaleNotificationService {
  notifyScaleMembers(input: unknown): Promise<unknown>;
  notifyPublishedScalesByDate(input: unknown): Promise<ScaleNotificationResult>;
}
