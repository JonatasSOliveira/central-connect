import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberFinalNotes extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _healthLimitations: string | null;
  protected readonly _leadershipNotes: string | null;

  constructor(params: MemberFinalNotesParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._healthLimitations = params.healthLimitations ?? null;
    this._leadershipNotes = params.leadershipNotes ?? null;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get healthLimitations(): string | null {
    return this._healthLimitations;
  }

  get leadershipNotes(): string | null {
    return this._leadershipNotes;
  }
}

export interface MemberFinalNotesParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  healthLimitations?: string | null;
  leadershipNotes?: string | null;
}
