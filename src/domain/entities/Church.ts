import { AuditableEntity, type AuditableEntityParams } from "./AuditableEntity";

export class Church extends AuditableEntity {
  protected readonly _name: string;

  constructor(params: ChurchParams) {
    super(params);
    this._name = params.name;
  }

  get name(): string {
    return this._name;
  }
}

export interface ChurchParams extends AuditableEntityParams {
  name: string;
}
