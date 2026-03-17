import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export type ScheduleStatus = "Confirmed" | "Pending" | "Cancelled" | "Paused";
export type ScheduleConfirmation = "Confirmed" | "Declined" | "Pending" | null;
export type ScheduleAttendance = "Present" | "Absent" | null;

export class Schedule extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _serviceId: string;
  protected readonly _ministryId: string;
  protected readonly _memberId: string;
  protected readonly _roleInSchedule: string | null;
  protected readonly _status: ScheduleStatus;
  protected readonly _confirmation: ScheduleConfirmation;
  protected readonly _confirmedAt: Date | null;
  protected readonly _attendance: ScheduleAttendance;
  protected readonly _cancellationReason: string | null;
  protected readonly _notes: string | null;

  constructor(params: ScheduleParams) {
    super(params);
    this._churchId = params.churchId;
    this._serviceId = params.serviceId;
    this._ministryId = params.ministryId;
    this._memberId = params.memberId;
    this._roleInSchedule = params.roleInSchedule ?? null;
    this._status = params.status ?? "Pending";
    this._confirmation = params.confirmation ?? null;
    this._confirmedAt = params.confirmedAt ?? null;
    this._attendance = params.attendance ?? null;
    this._cancellationReason = params.cancellationReason ?? null;
    this._notes = params.notes ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get ministryId(): string {
    return this._ministryId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get roleInSchedule(): string | null {
    return this._roleInSchedule;
  }

  get status(): ScheduleStatus {
    return this._status;
  }

  get confirmation(): ScheduleConfirmation {
    return this._confirmation;
  }

  get confirmedAt(): Date | null {
    return this._confirmedAt;
  }

  get attendance(): ScheduleAttendance {
    return this._attendance;
  }

  get cancellationReason(): string | null {
    return this._cancellationReason;
  }

  get notes(): string | null {
    return this._notes;
  }
}

export interface ScheduleParams extends AuditableEntityParams {
  churchId: string;
  serviceId: string;
  ministryId: string;
  memberId: string;
  roleInSchedule?: string | null;
  status?: ScheduleStatus;
  confirmation?: ScheduleConfirmation;
  confirmedAt?: Date | null;
  attendance?: ScheduleAttendance;
  cancellationReason?: string | null;
  notes?: string | null;
}
