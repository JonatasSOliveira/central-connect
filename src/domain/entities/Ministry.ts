import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class Ministry extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _name: string;
  protected readonly _leaderId: string | null;
  protected readonly _notes: string | null;

  constructor(params: MinistryParams) {
    super(params);
    this._churchId = params.churchId;
    this._name = params.name;
    this._leaderId = params.leaderId ?? null;
    this._notes = params.notes ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get name(): string {
    return this._name;
  }

  get leaderId(): string | null {
    return this._leaderId;
  }

  get notes(): string | null {
    return this._notes;
  }
}

export interface MinistryParams extends AuditableEntityParams {
  churchId: string;
  name: string;
  leaderId?: string | null;
  notes?: string | null;
}
