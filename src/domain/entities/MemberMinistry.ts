import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberMinistry extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _ministryId: string;

  constructor(params: MemberMinistryParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._ministryId = params.ministryId;
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
}

export interface MemberMinistryParams extends AuditableEntityParams {
  churchId: string;
  memberId: string;
  ministryId: string;
}
