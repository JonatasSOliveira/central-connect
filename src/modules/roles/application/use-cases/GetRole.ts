import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { GetRoleOutput } from "../dtos/role/ListRolesDTO";
import { RoleErrors } from "../errors/RoleErrors";

export interface GetRoleInput {
  roleId: string;
}

export class GetRole extends BaseUseCase<GetRoleInput, GetRoleOutput> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(input: GetRoleInput): Promise<Result<GetRoleOutput>> {
    try {
      const role = await this.roleRepository.findById(input.roleId);

      if (!role) {
        return {
          ok: false,
          error: RoleErrors.ROLE_NOT_FOUND,
        };
      }

      const rolePermissions = await this.rolePermissionRepository.findByRoleId(
        input.roleId,
      );

      const permissions = rolePermissions.map(
        (rp) => rp.permission as GetRoleOutput["permissions"][number],
      );

      return {
        ok: true,
        value: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions,
          isSystem: role.isSystem,
        },
      };
    } catch {
      return {
        ok: false,
        error: RoleErrors.ROLE_NOT_FOUND,
      };
    }
  }
}
