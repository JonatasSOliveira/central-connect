import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export type ScaleStatus = "draft" | "published";

export class Scale extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _serviceId: string;
  protected readonly _ministryId: string;
  protected readonly _status: ScaleStatus;
  protected readonly _notes: string | null;

  constructor(params: ScaleParams) {
    super(params);
    this._churchId = params.churchId;
    this._serviceId = params.serviceId;
    this._ministryId = params.ministryId;
    this._status = params.status ?? "draft";
    this._notes = params.notes ?? null;
  }

  get churchId(): string {
    return this._churchId;
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
}

export interface ScaleParams extends AuditableEntityParams {
  churchId: string;
  serviceId: string;
  ministryId: string;
  status?: ScaleStatus;
  notes?: string | null;
}
