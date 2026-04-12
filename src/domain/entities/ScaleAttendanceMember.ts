import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export type ScaleAttendanceMemberStatus =
  | "present"
  | "absent_unexcused"
  | "absent_excused";

export interface ScaleAttendanceMemberParams extends BaseEntityParams {
  scaleAttendanceId: string;
  scaleId: string;
  scaleMemberId: string;
  memberId: string;
  status: ScaleAttendanceMemberStatus;
  justification?: string | null;
  checkedAt?: Date | null;
  checkedByUserId?: string | null;
}

export class ScaleAttendanceMember extends BaseEntity {
  protected readonly _scaleAttendanceId: string;
  protected readonly _scaleId: string;
  protected readonly _scaleMemberId: string;
  protected readonly _memberId: string;
  protected readonly _status: ScaleAttendanceMemberStatus;
  protected readonly _justification: string | null;
  protected readonly _checkedAt: Date | null;
  protected readonly _checkedByUserId: string | null;

  constructor(params: ScaleAttendanceMemberParams) {
    super(params);
    this._scaleAttendanceId = params.scaleAttendanceId;
    this._scaleId = params.scaleId;
    this._scaleMemberId = params.scaleMemberId;
    this._memberId = params.memberId;
    this._status = params.status;
    this._justification = params.justification ?? null;
    this._checkedAt = params.checkedAt ?? null;
    this._checkedByUserId = params.checkedByUserId ?? null;
  }

  get scaleAttendanceId(): string {
    return this._scaleAttendanceId;
  }

  get scaleId(): string {
    return this._scaleId;
  }

  get scaleMemberId(): string {
    return this._scaleMemberId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get status(): ScaleAttendanceMemberStatus {
    return this._status;
  }

  get justification(): string | null {
    return this._justification;
  }

  get checkedAt(): Date | null {
    return this._checkedAt;
  }

  get checkedByUserId(): string | null {
    return this._checkedByUserId;
  }
}
