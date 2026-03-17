import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class User extends AuditableEntity {
  protected readonly _churchId: string | null;
  protected readonly _memberId: string | null;
  protected readonly _email: string | null;
  protected readonly _googleAccessToken: string | null;
  protected readonly _googleRefreshToken: string | null;
  protected readonly _userRoleId: string | null;
  protected readonly _isActive: boolean;
  protected readonly _isSuperAdmin: boolean;
  protected readonly _lastLoginAt: Date | null;

  constructor(params: UserParams) {
    super(params);
    this._churchId = params.churchId ?? null;
    this._memberId = params.memberId ?? null;
    this._email = params.email ?? null;
    this._googleAccessToken = params.googleAccessToken ?? null;
    this._googleRefreshToken = params.googleRefreshToken ?? null;
    this._userRoleId = params.userRoleId ?? null;
    this._isActive = params.isActive ?? true;
    this._isSuperAdmin = params.isSuperAdmin ?? false;
    this._lastLoginAt = params.lastLoginAt ?? null;
  }

  get churchId(): string | null {
    return this._churchId;
  }

  get memberId(): string | null {
    return this._memberId;
  }

  get email(): string | null {
    return this._email;
  }

  get googleAccessToken(): string | null {
    return this._googleAccessToken;
  }

  get googleRefreshToken(): string | null {
    return this._googleRefreshToken;
  }

  get userRoleId(): string | null {
    return this._userRoleId;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get isSuperAdmin(): boolean {
    return this._isSuperAdmin;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
}

export interface UserParams extends AuditableEntityParams {
  churchId?: string | null;
  memberId?: string | null;
  email?: string | null;
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  userRoleId?: string | null;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  lastLoginAt?: Date | null;
}
