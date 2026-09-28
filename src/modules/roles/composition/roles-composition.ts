import { validateSession } from "@/shared/presentation/http/auth";
import { CreateRole } from "@/modules/roles/application/use-cases/CreateRole";
import { DeleteRole } from "@/modules/roles/application/use-cases/DeleteRole";
import { GetRole } from "@/modules/roles/application/use-cases/GetRole";
import { ListRoles } from "@/modules/roles/application/use-cases/ListRoles";
import { UpdateRole } from "@/modules/roles/application/use-cases/UpdateRole";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import { createRoleHandler } from "@/modules/roles/presentation/http/handlers/role-handler";
import { createRolesHandler } from "@/modules/roles/presentation/http/handlers/roles-handler";

export function createRolesComposition(dependencies: {
  roleRepository: IRoleRepository;
  rolePermissionRepository: IRolePermissionRepository;
}) {
  const useCases = {
    createRole: new CreateRole(
      dependencies.roleRepository,
      dependencies.rolePermissionRepository,
    ),
    listRoles: new ListRoles(dependencies.roleRepository),
    getRole: new GetRole(
      dependencies.roleRepository,
      dependencies.rolePermissionRepository,
    ),
    updateRole: new UpdateRole(
      dependencies.roleRepository,
      dependencies.rolePermissionRepository,
    ),
    deleteRole: new DeleteRole(
      dependencies.roleRepository,
      dependencies.rolePermissionRepository,
    ),
  };

  return {
    httpHandlers: {
      roles: createRolesHandler(useCases, validateSession),
      role: createRoleHandler(useCases, validateSession),
    },
  };
}

export type RolesComposition = ReturnType<typeof createRolesComposition>;
