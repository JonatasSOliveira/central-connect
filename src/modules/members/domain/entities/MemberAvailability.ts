import {
  AuditableEntity,
  type AuditableEntityParams,
} from "@/shared/domain/entities/AuditableEntity";
import type { DayOfWeek } from "@/shared/domain/entities/DayOfWeek";

const VALID_DAYS: readonly DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export class MemberAvailability extends AuditableEntity {
  protected readonly _memberId: string;
  protected readonly _daysOfWeek: DayOfWeek[];

  constructor(params: MemberAvailabilityParams) {
    super(params);

    if (!params.memberId) {
      throw new Error("Member availability requires a member");
    }

    if (params.daysOfWeek.some((day) => !VALID_DAYS.includes(day))) {
      throw new Error("Member availability contains an invalid day");
    }

    if (new Set(params.daysOfWeek).size !== params.daysOfWeek.length) {
      throw new Error("Member availability cannot contain duplicate days");
    }

    this._memberId = params.memberId;
    this._daysOfWeek = [...params.daysOfWeek];
  }

  get memberId(): string {
    return this._memberId;
  }

  get daysOfWeek(): DayOfWeek[] {
    return [...this._daysOfWeek];
  }
}

export interface MemberAvailabilityParams extends AuditableEntityParams {
  memberId: string;
  daysOfWeek: DayOfWeek[];
}
