import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import { RoleErrors } from "../../errors/RoleErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeleteRoleInput {
  roleId: string;
}

export class DeleteRole extends BaseUseCase<DeleteRoleInput, void> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(input: DeleteRoleInput): Promise<Result<void>> {
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

      await this.rolePermissionRepository.deleteByRoleId(input.roleId);
      await this.roleRepository.delete(input.roleId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: RoleErrors.ROLE_DELETION_FAILED,
      };
    }
  }
}
