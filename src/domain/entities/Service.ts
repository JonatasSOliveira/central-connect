import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";
import type { DayOfWeek } from "./DayOfWeek";

export class Service extends AuditableEntity {
  protected readonly _churchId: string;
  protected readonly _serviceTemplateId: string | null;
  protected readonly _dayOfWeek: DayOfWeek;
  protected readonly _shift: string;
  protected readonly _time: string;
  protected readonly _date: Date;
  protected readonly _description: string | null;

  constructor(params: ServiceParams) {
    super(params);
    this._churchId = params.churchId;
    this._serviceTemplateId = params.serviceTemplateId ?? null;
    this._dayOfWeek = params.dayOfWeek;
    this._shift = params.shift;
    this._time = params.time;
    this._date = params.date;
    this._description = params.description ?? null;
  }

  get churchId(): string {
    return this._churchId;
  }

  get serviceTemplateId(): string | null {
    return this._serviceTemplateId;
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

  get date(): Date {
    return this._date;
  }

  get description(): string | null {
    return this._description;
  }
}

export interface ServiceParams extends AuditableEntityParams {
  churchId: string;
  serviceTemplateId?: string | null;
  dayOfWeek: DayOfWeek;
  shift: string;
  time: string;
  date: Date;
  description?: string | null;
}
