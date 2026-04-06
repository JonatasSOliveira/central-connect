import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class ScaleMember extends BaseEntity {
  protected readonly _scaleId: string;
  protected readonly _memberId: string;
  protected readonly _ministryRoleId: string;
  protected readonly _notes: string | null;

  constructor(params: ScaleMemberParams) {
    super(params);
    this._scaleId = params.scaleId;
    this._memberId = params.memberId;
    this._ministryRoleId = params.ministryRoleId;
    this._notes = params.notes ?? null;
  }

  get scaleId(): string {
    return this._scaleId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get ministryRoleId(): string {
    return this._ministryRoleId;
  }

  get notes(): string | null {
    return this._notes;
  }
}

export interface ScaleMemberParams extends BaseEntityParams {
  scaleId: string;
  memberId: string;
  ministryRoleId: string;
  notes?: string | null;
}
