import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { DayOfWeek } from "./DayOfWeek";

export class MemberAvailability extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _memberId: string;
  protected readonly _dayOfWeek: DayOfWeek;

  constructor(params: MemberAvailabilityParams) {
    super(params);
    this._churchId = params.churchId;
    this._memberId = params.memberId;
    this._dayOfWeek = params.dayOfWeek;
  }

  get churchId(): string {
    return this._churchId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get dayOfWeek(): DayOfWeek {
    return this._dayOfWeek;
  }
}

export interface MemberAvailabilityParams extends AuditableEntityParams {
  churchId: string;
  memberId: string;
  dayOfWeek: DayOfWeek;
}
