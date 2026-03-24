import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberChurch extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _roleId: string | null;

  constructor(params: MemberChurchParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._roleId = params.roleId ?? null;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get roleId(): string | null {
    return this._roleId;
  }
}

export interface MemberChurchParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  roleId?: string | null;
}
