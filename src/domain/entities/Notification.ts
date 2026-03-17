import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export type NotificationChannel = "WhatsApp" | "Email" | "Push";
export type NotificationStatus = "Sent" | "Failed" | "Pending";

export class Notification extends BaseEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _scheduleId: string;
  protected readonly _channel: NotificationChannel;
  protected readonly _status: NotificationStatus;
  protected readonly _attemptCount: number;
  protected readonly _lastAttemptAt: Date | null;
  protected readonly _sentAt: Date | null;

  constructor(params: NotificationParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._scheduleId = params.scheduleId;
    this._channel = params.channel;
    this._status = params.status ?? "Pending";
    this._attemptCount = params.attemptCount ?? 0;
    this._lastAttemptAt = params.lastAttemptAt ?? null;
    this._sentAt = params.sentAt ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get scheduleId(): string {
    return this._scheduleId;
  }

  get channel(): NotificationChannel {
    return this._channel;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  get attemptCount(): number {
    return this._attemptCount;
  }

  get lastAttemptAt(): Date | null {
    return this._lastAttemptAt;
  }

  get sentAt(): Date | null {
    return this._sentAt;
  }
}

export interface NotificationParams extends BaseEntityParams {
  churchId: string;
  memberId: string;
  scheduleId: string;
  channel: NotificationChannel;
  status?: NotificationStatus;
  attemptCount?: number;
  lastAttemptAt?: Date | null;
  sentAt?: Date | null;
}
