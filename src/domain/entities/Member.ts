import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export type MemberStatus = "Active" | "Inactive" | "Paused";

export class Member extends AuditableEntity {
  protected readonly _fullName: string;
  protected readonly _phone: string | null;
  protected readonly _role: string | null;
  protected readonly _maxServicesPerMonth: number;
  protected readonly _status: MemberStatus;
  protected readonly _avatarUrl: string | null;
  protected readonly _birthDate: Date | null;
  protected readonly _notes: string | null;

  constructor(params: MemberParams) {
    super(params);
    this._fullName = params.fullName;
    this._phone = params.phone ?? null;
    this._role = params.role ?? null;
    this._maxServicesPerMonth = params.maxServicesPerMonth ?? 4;
    this._status = params.status ?? "Active";
    this._avatarUrl = params.avatarUrl ?? null;
    this._birthDate = params.birthDate ?? null;
    this._notes = params.notes ?? null;
  }

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string | null {
    return this._phone;
  }

  get role(): string | null {
    return this._role;
  }

  get maxServicesPerMonth(): number {
    return this._maxServicesPerMonth;
  }

  get status(): MemberStatus {
    return this._status;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get birthDate(): Date | null {
    return this._birthDate;
  }

  get notes(): string | null {
    return this._notes;
  }
}

export interface MemberParams extends AuditableEntityParams {
  fullName: string;
  phone?: string | null;
  role?: string | null;
  maxServicesPerMonth?: number;
  status?: MemberStatus;
  avatarUrl?: string | null;
  birthDate?: Date | null;
  notes?: string | null;
}
