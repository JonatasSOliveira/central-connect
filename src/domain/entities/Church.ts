import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class Church extends AuditableEntity {
  protected readonly _name: string;
  protected readonly _selfSignupDefaultRoleId: string | null;

  constructor(params: ChurchParams) {
    super(params);
    this._name = params.name;
    this._selfSignupDefaultRoleId = params.selfSignupDefaultRoleId ?? null;
  }

  get name(): string {
    return this._name;
  }

  get selfSignupDefaultRoleId(): string | null {
    return this._selfSignupDefaultRoleId;
  }
}

export interface ChurchParams extends AuditableEntityParams {
  name: string;
  selfSignupDefaultRoleId?: string | null;
}
