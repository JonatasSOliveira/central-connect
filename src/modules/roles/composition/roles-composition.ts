import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { CreateRole } from "@/modules/roles/application/use-cases/CreateRole";
import { DeleteRole } from "@/modules/roles/application/use-cases/DeleteRole";
import { GetRole } from "@/modules/roles/application/use-cases/GetRole";
import { ListRoles } from "@/modules/roles/application/use-cases/ListRoles";
import { UpdateRole } from "@/modules/roles/application/use-cases/UpdateRole";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";
import { createRoleHandler } from "@/modules/roles/presentation/http/handlers/role-handler";
import { createRolesHandler } from "@/modules/roles/presentation/http/handlers/roles-handler";

export function createRolesComposition() {
  const database = getDatabaseClient();
  const roleRepository = new RoleDrizzleRepository(database);
  const rolePermissionRepository = new RolePermissionDrizzleRepository(database);
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
