import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export type ScaleAttendanceStatus = "draft" | "published";

export interface ScaleAttendanceParams extends AuditableEntityParams {
  churchId: string;
  scaleId: string;
  status?: ScaleAttendanceStatus;
  publishedAt?: Date | null;
  publishedByUserId?: string | null;
}

export class ScaleAttendance extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _scaleId: string;
  protected readonly _status: ScaleAttendanceStatus;
  protected readonly _publishedAt: Date | null;
  protected readonly _publishedByUserId: string | null;

  constructor(params: ScaleAttendanceParams) {
    super(params);
    this._churchId = params.churchId;
    this._scaleId = params.scaleId;
    this._status = params.status ?? "draft";
    this._publishedAt = params.publishedAt ?? null;
    this._publishedByUserId = params.publishedByUserId ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get scaleId(): string {
    return this._scaleId;
  }

  get status(): ScaleAttendanceStatus {
    return this._status;
  }

  get publishedAt(): Date | null {
    return this._publishedAt;
  }

  get publishedByUserId(): string | null {
    return this._publishedByUserId;
  }
}
