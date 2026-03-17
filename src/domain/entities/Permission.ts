import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class Permission extends BaseEntity {
  protected readonly _key: string;
  protected readonly _description: string;
  protected readonly _group: string;

  constructor(params: PermissionParams) {
    super(params);
    this._key = params.key;
    this._description = params.description;
    this._group = params.group;
  }

  get key(): string {
    return this._key;
  }

  get description(): string {
    return this._description;
  }

  get group(): string {
    return this._group;
  }
}

export interface PermissionParams extends BaseEntityParams {
  key: string;
  description: string;
  group: string;
}
