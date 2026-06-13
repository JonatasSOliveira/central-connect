import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberMinistryInterest extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _ministryId: string;

  constructor(params: MemberMinistryInterestParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._ministryId = params.ministryId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get ministryId(): string {
    return this._ministryId;
  }
}

export interface MemberMinistryInterestParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  ministryId: string;
}
