import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class Ministry extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _name: string;
  protected readonly _minMembersPerService: number;
  protected readonly _idealMembersPerService: number;
  protected readonly _notes: string | null;

  constructor(params: MinistryParams) {
    super(params);
    this._churchId = params.churchId;
    this._name = params.name;
    this._minMembersPerService = params.minMembersPerService;
    this._idealMembersPerService = params.idealMembersPerService;
    this._notes = params.notes ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get name(): string {
    return this._name;
  }

  get minMembersPerService(): number {
    return this._minMembersPerService;
  }

  get idealMembersPerService(): number {
    return this._idealMembersPerService;
  }

  get notes(): string | null {
    return this._notes;
  }
}

export interface MinistryParams extends AuditableEntityParams {
  churchId: string;
  name: string;
  minMembersPerService: number;
  idealMembersPerService: number;
  notes?: string | null;
}
