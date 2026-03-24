import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MinistryRole extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _ministryId: string;
  protected readonly _name: string;

  constructor(params: MinistryRoleParams) {
    super(params);
    this._churchId = params.churchId;
    this._ministryId = params.ministryId;
    this._name = params.name;
  }

  get churchId(): string {
    return this._churchId;
  }

  get ministryId(): string {
    return this._ministryId;
  }

  get name(): string {
    return this._name;
  }
}

export interface MinistryRoleParams extends AuditableEntityParams {
  churchId: string;
  ministryId: string;
  name: string;
}
