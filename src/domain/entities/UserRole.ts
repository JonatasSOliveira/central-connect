import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class UserRole extends BaseEntity {
  protected readonly _name: string;
  protected readonly _description: string | null;
  protected readonly _isSystem: boolean;

  constructor(params: UserRoleParams) {
    super(params);
    this._name = params.name;
    this._description = params.description ?? null;
    this._isSystem = params.isSystem;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get isSystem(): boolean {
    return this._isSystem;
  }
}

export interface UserRoleParams extends BaseEntityParams {
  name: string;
  description?: string | null;
  isSystem: boolean;
}
