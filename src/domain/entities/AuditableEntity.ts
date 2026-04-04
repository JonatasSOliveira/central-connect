import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export abstract class AuditableEntity extends BaseEntity {
  protected readonly _createdByUserId: string | null;
  protected readonly _updatedByUserId: string | null;
  protected readonly _deletedByUserId: string | null;

  constructor(params: AuditableEntityParams) {
    super(params);
    this._createdByUserId = params.createdByUserId ?? null;
    this._updatedByUserId = params.updatedByUserId ?? null;
    this._deletedByUserId = params.deletedByUserId ?? null;
  }

  get createdByUserId(): string | null {
    return this._createdByUserId;
  }

  get updatedByUserId(): string | null {
    return this._updatedByUserId;
  }

  get deletedByUserId(): string | null {
    return this._deletedByUserId;
  }
}

export interface AuditableEntityParams extends BaseEntityParams {
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
  deletedByUserId?: string | null;
}
