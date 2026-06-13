import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { PracticalSkill } from "@/domain/enums/PracticalSkill";

export class MemberPracticalSkill extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _skill: PracticalSkill;
  protected readonly _hasDriverLicense: boolean | null;
  protected readonly _hasOwnVehicle: boolean | null;
  protected readonly _languages: string | null;
  protected readonly _otherSkill: string | null;

  constructor(params: MemberPracticalSkillParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._skill = params.skill;
    this._hasDriverLicense = params.hasDriverLicense ?? null;
    this._hasOwnVehicle = params.hasOwnVehicle ?? null;
    this._languages = params.languages ?? null;
    this._otherSkill = params.otherSkill ?? null;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get skill(): PracticalSkill {
    return this._skill;
  }

  get hasDriverLicense(): boolean | null {
    return this._hasDriverLicense;
  }

  get hasOwnVehicle(): boolean | null {
    return this._hasOwnVehicle;
  }

  get languages(): string | null {
    return this._languages;
  }

  get otherSkill(): string | null {
    return this._otherSkill;
  }
}

export interface MemberPracticalSkillParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  skill: PracticalSkill;
  hasDriverLicense?: boolean | null;
  hasOwnVehicle?: boolean | null;
  languages?: string | null;
  otherSkill?: string | null;
}
