import type { GetSelfSignupContextOutputDTO } from "@/application/dtos/self-signup/GetSelfSignupContextDTO";
import { SelfSignupErrors } from "@/application/errors/SelfSignupErrors";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export interface GetSelfSignupChurchContextInput {
  churchId: string;
}

export class GetSelfSignupChurchContext extends BaseUseCase<
  GetSelfSignupChurchContextInput,
  GetSelfSignupContextOutputDTO
> {
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {
    super();
  }

  async execute(
    input: GetSelfSignupChurchContextInput,
  ): Promise<Result<GetSelfSignupContextOutputDTO>> {
    try {
      const church = await this.churchRepository.findById(input.churchId);

      if (!church) {
        return {
          ok: false,
          error: SelfSignupErrors.CHURCH_NOT_FOUND,
        };
      }

      const hasDefaultRoleConfigured = Boolean(church.selfSignupDefaultRoleId);
      const resolvedRole = await this.resolveRoleId(
        church.selfSignupDefaultRoleId,
      );

      if (!resolvedRole) {
        return {
          ok: true,
          value: {
            churchId: church.id,
            churchName: church.name,
            canProceed: false,
            selfSignupEnabled: false,
            hasDefaultRoleConfigured,
            defaultRoleId: null,
            message:
              "Auto cadastro indisponível no momento. Peça para a liderança configurar o cargo padrão.",
          },
        };
      }

      if (!resolvedRole.hasDefaultRoleConfigured) {
        return {
          ok: true,
          value: {
            churchId: church.id,
            churchName: church.name,
            canProceed: true,
            selfSignupEnabled: true,
            hasDefaultRoleConfigured,
            defaultRoleId: resolvedRole.roleId,
            message:
              "A igreja ainda não definiu um cargo padrão. Um cargo de menor privilégio será usado temporariamente.",
          },
        };
      }

      return {
        ok: true,
        value: {
          churchId: church.id,
          churchName: church.name,
          canProceed: true,
          selfSignupEnabled: true,
          hasDefaultRoleConfigured,
          defaultRoleId: resolvedRole.roleId,
          message: null,
        },
      };
    } catch {
      return {
        ok: false,
        error: SelfSignupErrors.SELF_SIGNUP_NOT_AVAILABLE,
      };
    }
  }

  private async resolveRoleId(
    configuredRoleId: string | null,
  ): Promise<{ roleId: string; hasDefaultRoleConfigured: boolean } | null> {
    if (configuredRoleId) {
      const role = await this.roleRepository.findById(configuredRoleId);
      if (!role) {
        return null;
      }

      return { roleId: role.id, hasDefaultRoleConfigured: true };
    }

    const fallbackRoleId = await this.findLowestPrivilegeRoleId();
    if (!fallbackRoleId) return null;

    return { roleId: fallbackRoleId, hasDefaultRoleConfigured: false };
  }

  private async findLowestPrivilegeRoleId(): Promise<string | null> {
    const roles = await this.roleRepository.findAll();
    if (roles.length === 0) return null;

    const roleScores = await Promise.all(
      roles.map(async (role) => {
        const permissions = await this.rolePermissionRepository.findByRoleId(
          role.id,
        );
        return {
          roleId: role.id,
          name: role.name,
          score: permissions.length,
        };
      }),
    );

    roleScores.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.name.localeCompare(b.name);
    });

    return roleScores[0]?.roleId ?? null;
  }
}
