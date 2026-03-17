import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class AuditLog extends BaseEntity {
  protected readonly _userId: string;
  protected readonly _churchId: string | null;
  protected readonly _action: string;
  protected readonly _entity: string;
  protected readonly _entityId: string;
  protected readonly _previousValue: string | null;
  protected readonly _newValue: string | null;

  constructor(params: AuditLogParams) {
    super(params);
    this._userId = params.userId;
    this._churchId = params.churchId ?? null;
    this._action = params.action;
    this._entity = params.entity;
    this._entityId = params.entityId;
    this._previousValue = params.previousValue ?? null;
    this._newValue = params.newValue ?? null;
  }

  get userId(): string {
    return this._userId;
  }

  get churchId(): string | null {
    return this._churchId;
  }

  get action(): string {
    return this._action;
  }

  get entity(): string {
    return this._entity;
  }

  get entityId(): string {
    return this._entityId;
  }

  get previousValue(): string | null {
    return this._previousValue;
  }

  get newValue(): string | null {
    return this._newValue;
  }
}

export interface AuditLogParams extends BaseEntityParams {
  userId: string;
  churchId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string | null;
  newValue?: string | null;
}
