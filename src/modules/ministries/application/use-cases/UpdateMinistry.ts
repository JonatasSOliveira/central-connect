import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import {
  Ministry,
  type MinistryParams,
} from "@/modules/ministries/domain/entities/Ministry";
import {
  MinistryRole,
  type MinistryRoleParams,
} from "@/modules/ministries/domain/entities/MinistryRole";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  MinistryDetailDTO,
  MinistryRoleListItemDTO,
} from "../dtos/ministry/MinistryDTO";
import { MinistryErrors } from "../errors/MinistryErrors";

export interface UpdateMinistryRoleInput {
  id: string | null;
  name: string;
  requiredCount: number;
}

export interface UpdateMinistryInput {
  ministryId: string;
  churchId: string;
  name: string;
  leaderId?: string | null;
  notes?: string | null;
  roles: UpdateMinistryRoleInput[];
  updatedByUserId: string;
}

export interface UpdateMinistryOutput {
  ministry: MinistryDetailDTO;
}

export class UpdateMinistry extends BaseUseCase<
  UpdateMinistryInput,
  UpdateMinistryOutput
> {
  constructor(
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(
    input: UpdateMinistryInput,
  ): Promise<Result<UpdateMinistryOutput>> {
    try {
      const existingMinistry = await this.ministryRepository.findById(
        input.ministryId,
      );

      if (!existingMinistry) {
        return {
          ok: false,
          error: MinistryErrors.MINISTRY_NOT_FOUND,
        };
      }

      if (existingMinistry.name !== input.name) {
        const duplicateMinistry =
          await this.ministryRepository.findByChurchIdAndName(
            existingMinistry.churchId,
            input.name,
            existingMinistry.id,
          );
        if (duplicateMinistry) {
          return {
            ok: false,
            error: MinistryErrors.MINISTRY_ALREADY_EXISTS,
          };
        }
      }

      const ministryParams: MinistryParams = {
        id: existingMinistry.id,
        churchId: existingMinistry.churchId,
        name: input.name,
        leaderId: input.leaderId ?? null,
        notes: input.notes ?? null,
        createdByUserId: existingMinistry.createdByUserId ?? null,
        createdAt: existingMinistry.createdAt,
        updatedAt: new Date(),
        updatedByUserId: input.updatedByUserId,
      };

      const ministry = new Ministry(ministryParams);
      const updatedMinistry = await this.ministryRepository.update(ministry);

      const existingRoles = await this.ministryRoleRepository.findByMinistryId(
        updatedMinistry.id,
      );

      const existingRoleIds = new Set(
        input.roles.filter((r) => r.id).map((r) => r.id),
      );

      if (existingRoleIds.size !== input.roles.filter((r) => r.id).length) {
        return {
          ok: false,
          error: MinistryErrors.MINISTRY_ROLE_UPDATE_FAILED,
        };
      }

      const rolesToDelete = existingRoles.filter(
        (r) => !existingRoleIds.has(r.id),
      );
      for (const role of rolesToDelete) {
        await this.ministryRoleRepository.delete(role.id);
      }

      const finalRoles: MinistryRoleListItemDTO[] = [];

      for (const [index, roleInput] of input.roles.entries()) {
        const displayOrder = index + 1;
        if (roleInput.id) {
          const existingRole = existingRoles.find((r) => r.id === roleInput.id);
          if (!existingRole) {
            return {
              ok: false,
              error: MinistryErrors.MINISTRY_ROLE_NOT_BELONG_TO_MINISTRY,
            };
          }

          if (existingRole) {
            if (
              existingRole.name !== roleInput.name ||
              existingRole.requiredCount !== roleInput.requiredCount ||
              existingRole.displayOrder !== displayOrder
            ) {
              const roleParams: MinistryRoleParams = {
                id: existingRole.id,
                ministryId: existingRole.ministryId,
                name: roleInput.name,
                requiredCount: roleInput.requiredCount,
                displayOrder,
                createdByUserId: existingRole.createdByUserId ?? null,
                createdAt: existingRole.createdAt,
                updatedAt: new Date(),
                updatedByUserId: input.updatedByUserId,
              };
              const role = new MinistryRole(roleParams);
              const updatedRole =
                await this.ministryRoleRepository.update(role);
              finalRoles.push({
                id: updatedRole.id,
                name: updatedRole.name,
                requiredCount: updatedRole.requiredCount,
                displayOrder: updatedRole.displayOrder,
              });
            } else {
              finalRoles.push({
                id: existingRole.id,
                name: existingRole.name,
                requiredCount: existingRole.requiredCount,
                displayOrder: existingRole.displayOrder,
              });
            }
          }
        } else {
          const roleParams: MinistryRoleParams = {
            ministryId: updatedMinistry.id,
            name: roleInput.name,
            requiredCount: roleInput.requiredCount,
            displayOrder,
            createdByUserId: input.updatedByUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const role = new MinistryRole(roleParams);
          const createdRole = await this.ministryRoleRepository.create(role);
          finalRoles.push({
            id: createdRole.id,
            name: createdRole.name,
            requiredCount: createdRole.requiredCount,
            displayOrder: createdRole.displayOrder,
          });
        }
      }

      return {
        ok: true,
        value: {
          ministry: {
            id: updatedMinistry.id,
            churchId: updatedMinistry.churchId,
            name: updatedMinistry.name,
            leaderId: updatedMinistry.leaderId,
            notes: updatedMinistry.notes,
            createdAt: updatedMinistry.createdAt,
            roles: finalRoles,
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: MinistryErrors.MINISTRY_UPDATE_FAILED,
      };
    }
  }
}
