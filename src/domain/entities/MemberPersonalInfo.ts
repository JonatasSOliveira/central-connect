import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { MaritalStatus } from "@/domain/enums/MaritalStatus";

export class MemberPersonalInfo extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _maritalStatus: MaritalStatus;
  protected readonly _hasChildren: boolean;
  protected readonly _childrenCount: number | null;
  protected readonly _childrenAges: string | null;
  protected readonly _neighborhood: string;

  constructor(params: MemberPersonalInfoParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._maritalStatus = params.maritalStatus;
    this._hasChildren = params.hasChildren;
    this._childrenCount = params.childrenCount ?? null;
    this._childrenAges = params.childrenAges ?? null;
    this._neighborhood = params.neighborhood;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get maritalStatus(): MaritalStatus {
    return this._maritalStatus;
  }

  get hasChildren(): boolean {
    return this._hasChildren;
  }

  get childrenCount(): number | null {
    return this._childrenCount;
  }

  get childrenAges(): string | null {
    return this._childrenAges;
  }

  get neighborhood(): string {
    return this._neighborhood;
  }
}

export interface MemberPersonalInfoParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  maritalStatus: MaritalStatus;
  hasChildren: boolean;
  childrenCount?: number | null;
  childrenAges?: string | null;
  neighborhood: string;
}
