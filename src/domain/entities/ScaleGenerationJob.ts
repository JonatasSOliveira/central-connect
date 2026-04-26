import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export type ScaleGenerationJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export class ScaleGenerationJob extends BaseEntity {
  protected readonly _churchId: string;
  protected readonly _serviceId: string | null;
  protected readonly _status: ScaleGenerationJobStatus;
  protected readonly _scheduledFor: Date;
  protected readonly _startedAt: Date | null;
  protected readonly _completedAt: Date | null;
  protected readonly _leaseExpiresAt: Date | null;
  protected readonly _error: string | null;

  constructor(params: ScaleGenerationJobParams) {
    super(params);
    this._churchId = params.churchId;
    this._serviceId = params.serviceId ?? null;
    this._status = params.status ?? "pending";
    this._scheduledFor = params.scheduledFor;
    this._startedAt = params.startedAt ?? null;
    this._completedAt = params.completedAt ?? null;
    this._leaseExpiresAt = params.leaseExpiresAt ?? null;
    this._error = params.error ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get serviceId(): string | null {
    return this._serviceId;
  }

  get status(): ScaleGenerationJobStatus {
    return this._status;
  }

  get scheduledFor(): Date {
    return this._scheduledFor;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get leaseExpiresAt(): Date | null {
    return this._leaseExpiresAt;
  }

  get error(): string | null {
    return this._error;
  }

  get isLocked(): boolean {
    if (!this._leaseExpiresAt) return false;
    return new Date() < this._leaseExpiresAt;
  }
}

export interface ScaleGenerationJobParams extends BaseEntityParams {
  churchId: string;
  serviceId?: string | null;
  status?: ScaleGenerationJobStatus;
  scheduledFor: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
  leaseExpiresAt?: Date | null;
  error?: string | null;
}