import { validateSession } from "@/app/api/_lib/auth";
import { CreateRole } from "@/modules/roles/application/use-cases/CreateRole";
import { DeleteRole } from "@/modules/roles/application/use-cases/DeleteRole";
import { GetRole } from "@/modules/roles/application/use-cases/GetRole";
import { ListRoles } from "@/modules/roles/application/use-cases/ListRoles";
import { UpdateRole } from "@/modules/roles/application/use-cases/UpdateRole";
import { RoleFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RoleFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RolePermissionFirebaseRepository";
import { createRoleHandler } from "@/modules/roles/presentation/http/handlers/role-handler";
import { createRolesHandler } from "@/modules/roles/presentation/http/handlers/roles-handler";

export function createRolesComposition() {
  const roleRepository = new RoleFirebaseRepository();
  const rolePermissionRepository = new RolePermissionFirebaseRepository();
  const useCases = {
    createRole: new CreateRole(roleRepository, rolePermissionRepository),
    listRoles: new ListRoles(roleRepository),
    getRole: new GetRole(roleRepository, rolePermissionRepository),
    updateRole: new UpdateRole(roleRepository, rolePermissionRepository),
    deleteRole: new DeleteRole(roleRepository, rolePermissionRepository),
  };

  return {
    httpHandlers: {
      roles: createRolesHandler(useCases, validateSession),
      role: createRoleHandler(useCases, validateSession),
    },
  };
}

export type RolesComposition = ReturnType<typeof createRolesComposition>;
