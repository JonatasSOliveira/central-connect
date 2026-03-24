import { CreateRole } from "@/application/use-cases/role/CreateRole";
import { DeleteRole } from "@/application/use-cases/role/DeleteRole";
import { GetRole } from "@/application/use-cases/role/GetRole";
import { ListRoles } from "@/application/use-cases/role/ListRoles";
import { UpdateRole } from "@/application/use-cases/role/UpdateRole";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import { RoleFirebaseRepository } from "@/infra/firebase-admin/repositories/RoleFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/infra/firebase-admin/repositories/RolePermissionFirebaseRepository";

class RoleContainer {
  private static _roleRepository: IRoleRepository | null = null;
  private static _rolePermissionRepository: IRolePermissionRepository | null =
    null;
  private static _createRole: CreateRole | null = null;
  private static _listRoles: ListRoles | null = null;
  private static _getRole: GetRole | null = null;
  private static _updateRole: UpdateRole | null = null;
  private static _deleteRole: DeleteRole | null = null;

  private constructor() {}

  static get roleRepository(): IRoleRepository {
    if (!RoleContainer._roleRepository) {
      RoleContainer._roleRepository = new RoleFirebaseRepository();
    }
    return RoleContainer._roleRepository;
  }

  static get rolePermissionRepository(): IRolePermissionRepository {
    if (!RoleContainer._rolePermissionRepository) {
      RoleContainer._rolePermissionRepository =
        new RolePermissionFirebaseRepository();
    }
    return RoleContainer._rolePermissionRepository;
  }

  static get createRole(): CreateRole {
    if (!RoleContainer._createRole) {
      RoleContainer._createRole = new CreateRole(
        RoleContainer.roleRepository,
        RoleContainer.rolePermissionRepository,
      );
    }
    return RoleContainer._createRole;
  }

  static get listRoles(): ListRoles {
    if (!RoleContainer._listRoles) {
      RoleContainer._listRoles = new ListRoles(RoleContainer.roleRepository);
    }
    return RoleContainer._listRoles;
  }

  static get getRole(): GetRole {
    if (!RoleContainer._getRole) {
      RoleContainer._getRole = new GetRole(
        RoleContainer.roleRepository,
        RoleContainer.rolePermissionRepository,
      );
    }
    return RoleContainer._getRole;
  }

  static get updateRole(): UpdateRole {
    if (!RoleContainer._updateRole) {
      RoleContainer._updateRole = new UpdateRole(
        RoleContainer.roleRepository,
        RoleContainer.rolePermissionRepository,
      );
    }
    return RoleContainer._updateRole;
  }

  static get deleteRole(): DeleteRole {
    if (!RoleContainer._deleteRole) {
      RoleContainer._deleteRole = new DeleteRole(
        RoleContainer.roleRepository,
        RoleContainer.rolePermissionRepository,
      );
    }
    return RoleContainer._deleteRole;
  }
}

export const roleContainer = RoleContainer;
