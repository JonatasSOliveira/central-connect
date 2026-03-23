import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { ListRolesOutput } from "../../dtos/role/ListRolesDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListRoles extends BaseUseCase<undefined, ListRolesOutput> {
  constructor(private readonly roleRepository: IRoleRepository) {
    super();
  }

  async execute(): Promise<Result<ListRolesOutput>> {
    try {
      const roles = await this.roleRepository.findAll();

      const rolesList = roles.map((role) => ({
        id: role.id,
        name: role.name,
      }));

      return {
        ok: true,
        value: {
          roles: rolesList,
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
