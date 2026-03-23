import { CreateRole } from "@/application/use-cases/role/CreateRole";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import { RoleFirebaseRepository } from "@/infra/firebase-admin/repositories/RoleFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/infra/firebase-admin/repositories/RolePermissionFirebaseRepository";

class RoleContainer {
  private static _roleRepository: IRoleRepository | null = null;
  private static _rolePermissionRepository: IRolePermissionRepository | null =
    null;
  private static _createRole: CreateRole | null = null;

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
}

export const roleContainer = RoleContainer;
