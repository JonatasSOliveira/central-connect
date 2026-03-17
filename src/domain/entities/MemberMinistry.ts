import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberMinistry extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _ministryId: string;
  protected readonly _order: number;

  constructor(params: MemberMinistryParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._ministryId = params.ministryId;
    this._order = params.order;
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

  get order(): number {
    return this._order;
  }
}

export interface MemberMinistryParams extends AuditableEntityParams {
  churchId: string;
  memberId: string;
  ministryId: string;
  order: number;
}
