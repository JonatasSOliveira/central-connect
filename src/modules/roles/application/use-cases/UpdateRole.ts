import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { RolePermission } from "@/modules/roles/domain/entities/RolePermission";
import { UserRole } from "@/modules/roles/domain/entities/UserRole";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  UpdateRoleInput,
  UpdateRoleOutput,
} from "../dtos/role/UpdateRoleDTO";
import { RoleErrors } from "../errors/RoleErrors";

export class UpdateRole extends BaseUseCase<UpdateRoleInput, UpdateRoleOutput> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(
    input: UpdateRoleInput & { roleId: string },
  ): Promise<Result<UpdateRoleOutput>> {
    try {
      const existingRole = await this.roleRepository.findById(input.roleId);

      if (!existingRole) {
        return {
          ok: false,
          error: RoleErrors.ROLE_NOT_FOUND,
        };
      }

      if (existingRole.isSystem) {
        return {
          ok: false,
          error: RoleErrors.ROLE_IS_SYSTEM,
        };
      }

      const updatedRoleEntity = new UserRole({
        id: existingRole.id,
        name: input.name,
        description: input.description ?? null,
        isSystem: existingRole.isSystem,
        createdAt: existingRole.createdAt,
        updatedAt: new Date(),
      });

      const updatedRole = await this.roleRepository.update(updatedRoleEntity);

      await this.rolePermissionRepository.deleteByRoleId(input.roleId);

      const rolePermissions = input.permissions.map((permission) => {
        return new RolePermission({
          userRoleId: input.roleId,
          permission,
        });
      });

      await this.rolePermissionRepository.createMany(rolePermissions);

      return {
        ok: true,
        value: {
          id: updatedRole.id,
          name: updatedRole.name,
          description: updatedRole.description,
          permissions: input.permissions as unknown as string[],
          isSystem: updatedRole.isSystem,
          createdAt: updatedRole.createdAt,
          updatedAt: updatedRole.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: RoleErrors.ROLE_UPDATE_FAILED,
      };
    }
  }
}
