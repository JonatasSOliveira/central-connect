import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class Invite extends AuditableEntity {
  protected readonly _email: string;
  protected readonly _roleId: string;
  protected readonly _churchId: string;
  protected readonly _isUsed: boolean;
  protected readonly _usedAt: Date | null;

  constructor(params: InviteParams) {
    super(params);
    this._email = params.email;
    this._roleId = params.roleId;
    this._churchId = params.churchId;
    this._isUsed = params.isUsed ?? false;
    this._usedAt = params.usedAt ?? null;
  }

  get email(): string {
    return this._email;
  }

  get roleId(): string {
    return this._roleId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get isUsed(): boolean {
    return this._isUsed;
  }

  get usedAt(): Date | null {
    return this._usedAt;
  }
}

export interface InviteParams extends AuditableEntityParams {
  email: string;
  roleId: string;
  churchId: string;
  isUsed?: boolean;
  usedAt?: Date | null;
}
