import { RolePermission } from "@/domain/entities/RolePermission";
import { UserRole } from "@/domain/entities/UserRole";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import type {
  CreateRoleInput,
  CreateRoleOutput,
} from "../../dtos/role/CreateRoleDTO";
import { RoleErrors } from "../../errors/RoleErrors";
import { BaseUseCase } from "../BaseUseCase";

export class CreateRole extends BaseUseCase<CreateRoleInput, CreateRoleOutput> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(input: CreateRoleInput): Promise<Result<CreateRoleOutput>> {
    try {
      const existingRole = await this.roleRepository.findByName(input.name);
      if (existingRole) {
        return {
          ok: false,
          error: RoleErrors.ROLE_ALREADY_EXISTS,
        };
      }

      const role = new UserRole({
        name: input.name,
        description: input.description ?? null,
        isSystem: false,
      });

      const createdRole = await this.roleRepository.create(role);

      const rolePermissions = input.permissions.map((permission) => {
        return new RolePermission({
          userRoleId: createdRole.id,
          permission,
        });
      });

      await this.rolePermissionRepository.createMany(rolePermissions);

      return {
        ok: true,
        value: {
          id: createdRole.id,
          name: createdRole.name,
          description: createdRole.description,
          permissions: input.permissions,
          isSystem: createdRole.isSystem,
          createdAt: createdRole.createdAt,
          updatedAt: createdRole.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: RoleErrors.ROLE_CREATION_FAILED,
      };
    }
  }
}
