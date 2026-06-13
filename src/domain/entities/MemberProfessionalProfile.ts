import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { MutiraoAvailability } from "@/domain/enums/MutiraoAvailability";

export class MemberProfessionalProfile extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _currentProfession: string;
  protected readonly _mutiraoAvailability: MutiraoAvailability;

  constructor(params: MemberProfessionalProfileParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._currentProfession = params.currentProfession;
    this._mutiraoAvailability = params.mutiraoAvailability;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get currentProfession(): string {
    return this._currentProfession;
  }

  get mutiraoAvailability(): MutiraoAvailability {
    return this._mutiraoAvailability;
  }
}

export interface MemberProfessionalProfileParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  currentProfession: string;
  mutiraoAvailability: MutiraoAvailability;
}
