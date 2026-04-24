import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { AvailabilityMode } from "./AvailabilityMode";
import type { DayOfWeek } from "./DayOfWeek";

export class MemberAvailability extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _mode: AvailabilityMode;
  protected readonly _daysOfWeek: DayOfWeek[];

  constructor(params: MemberAvailabilityParams) {
    super(params);
    this._memberId = params.memberId;
    this._mode = params.mode;
    this._daysOfWeek = params.daysOfWeek;
  }

  get memberId(): string {
    return this._memberId;
  }

  get mode(): AvailabilityMode {
    return this._mode;
  }

  get daysOfWeek(): DayOfWeek[] {
    return this._daysOfWeek;
  }
}

export interface MemberAvailabilityParams extends AuditableEntityParams {
  memberId: string;
  mode: AvailabilityMode;
  daysOfWeek: DayOfWeek[];
}
