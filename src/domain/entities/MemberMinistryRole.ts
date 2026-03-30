import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberMinistryRole extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _ministryId: string;
  protected readonly _ministryRoleId: string;

  constructor(params: MemberMinistryRoleParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._ministryId = params.ministryId;
    this._ministryRoleId = params.ministryRoleId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get ministryId(): string {
    return this._ministryId;
  }

  get ministryRoleId(): string {
    return this._ministryRoleId;
  }
}

export interface MemberMinistryRoleParams extends AuditableEntityParams {
  churchId: string;
  memberId: string;
  ministryId: string;
  ministryRoleId: string;
}
