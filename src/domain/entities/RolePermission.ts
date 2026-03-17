import { BaseEntity, type BaseEntityParams } from "./BaseEntity";

export class RolePermission extends BaseEntity {
  protected readonly _userRoleId: string;
  protected readonly _permissionId: string;

  constructor(params: RolePermissionParams) {
    super(params);
    this._userRoleId = params.userRoleId;
    this._permissionId = params.permissionId;
  }

  get userRoleId(): string {
    return this._userRoleId;
  }

  get permissionId(): string {
    return this._permissionId;
  }
}

export interface RolePermissionParams extends BaseEntityParams {
  userRoleId: string;
  permissionId: string;
}
