import {
  AuditableEntity,
  type AuditableEntityParams,
} from "@/shared/domain/entities/AuditableEntity";

export type ScaleStatus = "draft" | "published";

export class Scale extends AuditableEntity {
  protected readonly _serviceId: string;
  protected readonly _ministryId: string;
  protected readonly _status: ScaleStatus;
  protected readonly _notes: string | null;
  protected readonly _publishedAt: Date | null;
  protected readonly _publishedByUserId: string | null;

  constructor(params: ScaleParams) {
    super(params);
    this._serviceId = params.serviceId;
    this._ministryId = params.ministryId;
    this._status = params.status ?? "draft";
    this._notes = params.notes ?? null;
    this._publishedAt = params.publishedAt ?? null;
    this._publishedByUserId = params.publishedByUserId ?? null;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get ministryId(): string {
    return this._ministryId;
  }

  get status(): ScaleStatus {
    return this._status;
  }

  get notes(): string | null {
    return this._notes;
  }

  get publishedAt(): Date | null {
    return this._publishedAt;
  }

  get publishedByUserId(): string | null {
    return this._publishedByUserId;
  }
}

export interface ScaleParams extends AuditableEntityParams {
  serviceId: string;
  ministryId: string;
  status?: ScaleStatus;
  notes?: string | null;
  publishedAt?: Date | null;
  publishedByUserId?: string | null;
}
