export class RolePermission {
  protected readonly _userRoleId: string;
  protected readonly _permission: string;

  constructor(params: RolePermissionParams) {
    this._userRoleId = params.userRoleId;
    this._permission = params.permission;
  }

  get userRoleId(): string {
    return this._userRoleId;
  }

  get permission(): string {
    return this._permission;
  }

  get compositeId(): string {
    return `${this._userRoleId}:${this._permission}`;
  }
}

export interface RolePermissionParams {
  userRoleId: string;
  permission: string;
}
