import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class LegalConsent extends BaseEntity {
  protected readonly _memberId: string;
  protected readonly _userId: string;
  protected readonly _churchId: string;
  protected readonly _termsVersion: string;
  protected readonly _privacyPolicyVersion: string;
  protected readonly _acceptedAt: Date;
  protected readonly _ipAddress: string | null;
  protected readonly _userAgent: string | null;
  protected readonly _source: LegalConsentSource;

  constructor(params: LegalConsentParams) {
    super(params);
    this._memberId = params.memberId;
    this._userId = params.userId;
    this._churchId = params.churchId;
    this._termsVersion = params.termsVersion;
    this._privacyPolicyVersion = params.privacyPolicyVersion;
    this._acceptedAt = params.acceptedAt ?? params.createdAt ?? new Date();
    this._ipAddress = params.ipAddress ?? null;
    this._userAgent = params.userAgent ?? null;
    this._source = params.source;
  }

  get memberId(): string {
    return this._memberId;
  }

  get userId(): string {
    return this._userId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get termsVersion(): string {
    return this._termsVersion;
  }

  get privacyPolicyVersion(): string {
    return this._privacyPolicyVersion;
  }

  get acceptedAt(): Date {
    return this._acceptedAt;
  }

  get ipAddress(): string | null {
    return this._ipAddress;
  }

  get userAgent(): string | null {
    return this._userAgent;
  }

  get source(): LegalConsentSource {
    return this._source;
  }
}

export type LegalConsentSource = "self-signup";

export interface LegalConsentParams extends BaseEntityParams {
  memberId: string;
  userId: string;
  churchId: string;
  termsVersion: string;
  privacyPolicyVersion: string;
  acceptedAt?: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  source: LegalConsentSource;
}
