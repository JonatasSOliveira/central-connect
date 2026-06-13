import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class MemberServiceProfile extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _churchId: string;
  protected readonly _currentlyServes: boolean;
  protected readonly _instrumentalPraiseInstrument: string | null;
  protected readonly _otherDesiredMinistry: string | null;

  constructor(params: MemberServiceProfileParams) {
    super(params);
    this._memberId = params.memberId;
    this._churchId = params.churchId;
    this._currentlyServes = params.currentlyServes;
    this._instrumentalPraiseInstrument =
      params.instrumentalPraiseInstrument ?? null;
    this._otherDesiredMinistry = params.otherDesiredMinistry ?? null;
  }

  get memberId(): string {
    return this._memberId;
  }

  get churchId(): string {
    return this._churchId;
  }

  get currentlyServes(): boolean {
    return this._currentlyServes;
  }

  get instrumentalPraiseInstrument(): string | null {
    return this._instrumentalPraiseInstrument;
  }

  get otherDesiredMinistry(): string | null {
    return this._otherDesiredMinistry;
  }
}

export interface MemberServiceProfileParams extends AuditableEntityParams {
  memberId: string;
  churchId: string;
  currentlyServes: boolean;
  instrumentalPraiseInstrument?: string | null;
  otherDesiredMinistry?: string | null;
}
