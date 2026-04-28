import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export type PushPlatform = "web";

export class MemberPushToken extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _token: string;
  protected readonly _deviceId: string | null;
  protected readonly _platform: PushPlatform;
  protected readonly _isActive: boolean;
  protected readonly _failureCount: number;
  protected readonly _lastSeenAt: Date | null;
  protected readonly _lastFailureAt: Date | null;

  constructor(params: MemberPushTokenParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._token = params.token;
    this._deviceId = params.deviceId ?? null;
    this._platform = params.platform ?? "web";
    this._isActive = params.isActive ?? true;
    this._failureCount = params.failureCount ?? 0;
    this._lastSeenAt = params.lastSeenAt ?? null;
    this._lastFailureAt = params.lastFailureAt ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get token(): string {
    return this._token;
  }

  get deviceId(): string | null {
    return this._deviceId;
  }

  get platform(): PushPlatform {
    return this._platform;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get failureCount(): number {
    return this._failureCount;
  }

  get lastSeenAt(): Date | null {
    return this._lastSeenAt;
  }

  get lastFailureAt(): Date | null {
    return this._lastFailureAt;
  }
}

export interface MemberPushTokenParams extends AuditableEntityParams {
  churchId: string;
  memberId: string;
  token: string;
  deviceId?: string | null;
  platform?: PushPlatform;
  isActive?: boolean;
  failureCount?: number;
  lastSeenAt?: Date | null;
  lastFailureAt?: Date | null;
}
