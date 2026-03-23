import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { ListRolesOutput } from "../../dtos/role/ListRolesDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListRoles extends BaseUseCase<undefined, ListRolesOutput> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(): Promise<Result<ListRolesOutput>> {
    try {
      const roles = await this.roleRepository.findAll();

      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const rolePermissions =
            await this.rolePermissionRepository.findByRoleId(role.id);
          return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: rolePermissions.map((rp) => rp.permission),
            isSystem: role.isSystem,
          };
        }),
      );

      return {
        ok: true,
        value: {
          roles: rolesWithPermissions,
        },
      };
    } catch {
      return {
        ok: false,
        error: { code: "LIST_ROLES_FAILED", message: "Falha ao listar roles" },
      };
    }
  }
}
