import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

const DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER = 2;

export class Church extends AuditableEntity {
  protected readonly _name: string;
  protected readonly _selfSignupDefaultRoleId: string | null;
  protected readonly _maxConsecutiveScalesPerMember: number;

  constructor(params: ChurchParams) {
    super(params);
    this._name = params.name;
    this._selfSignupDefaultRoleId = params.selfSignupDefaultRoleId ?? null;
    this._maxConsecutiveScalesPerMember =
      params.maxConsecutiveScalesPerMember ??
      DEFAULT_MAX_CONSECUTIVE_SCALES_PER_MEMBER;
  }

  get name(): string {
    return this._name;
  }

  get selfSignupDefaultRoleId(): string | null {
    return this._selfSignupDefaultRoleId;
  }

  get maxConsecutiveScalesPerMember(): number {
    return this._maxConsecutiveScalesPerMember;
  }
}

export interface ChurchParams extends AuditableEntityParams {
  name: string;
  selfSignupDefaultRoleId?: string | null;
  maxConsecutiveScalesPerMember?: number;
}
