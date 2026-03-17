import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { DayOfWeek } from "./DayOfWeek";

export class ServiceTemplate extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _dayOfWeek: DayOfWeek;
  protected readonly _shift: string;
  protected readonly _time: string;
  protected readonly _isActive: boolean;

  constructor(params: ServiceTemplateParams) {
    super(params);
    this._churchId = params.churchId;
    this._dayOfWeek = params.dayOfWeek;
    this._shift = params.shift;
    this._time = params.time;
    this._isActive = params.isActive ?? true;
  }

  get churchId(): string {
    return this._churchId;
  }

  get dayOfWeek(): DayOfWeek {
    return this._dayOfWeek;
  }

  get shift(): string {
    return this._shift;
  }

  get time(): string {
    return this._time;
  }

  get isActive(): boolean {
    return this._isActive;
  }
}

export interface ServiceTemplateParams extends AuditableEntityParams {
  churchId: string;
  dayOfWeek: DayOfWeek;
  shift: string;
  time: string;
  isActive?: boolean;
}
