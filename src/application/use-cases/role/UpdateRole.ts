import { RolePermission } from "@/domain/entities/RolePermission";
import { UserRole } from "@/domain/entities/UserRole";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import type {
  UpdateRoleInput,
  UpdateRoleOutput,
} from "../../dtos/role/UpdateRoleDTO";
import { RoleErrors } from "../../errors/RoleErrors";
import { BaseUseCase } from "../BaseUseCase";

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
