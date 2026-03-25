import { Ministry, type MinistryParams } from "@/domain/entities/Ministry";
import {
  MinistryRole,
  type MinistryRoleParams,
} from "@/domain/entities/MinistryRole";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { MinistryDetailDTO } from "../../dtos/ministry/MinistryDTO";
import { MinistryErrors } from "../../errors/MinistryErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface CreateMinistryInput {
  churchId: string;
  name: string;
  liderId?: string | null;
  minMembersPerService: number;
  idealMembersPerService: number;
  notes?: string | null;
  roles: { name: string }[];
  createdByUserId: string;
}

export interface CreateMinistryOutput {
  ministry: MinistryDetailDTO;
}

export class CreateMinistry extends BaseUseCase<
  CreateMinistryInput,
  CreateMinistryOutput
> {
  constructor(
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(
    input: CreateMinistryInput,
  ): Promise<Result<CreateMinistryOutput>> {
    try {
      const existingMinistry =
        await this.ministryRepository.findByChurchIdAndName(
          input.churchId,
          input.name,
        );
      if (existingMinistry) {
        return {
          ok: false,
          error: MinistryErrors.MINISTRY_ALREADY_EXISTS,
        };
      }

      const ministryParams: MinistryParams = {
        churchId: input.churchId,
        name: input.name,
        liderId: input.liderId ?? null,
        minMembersPerService: input.minMembersPerService,
        idealMembersPerService: input.idealMembersPerService,
        notes: input.notes ?? null,
        createdByUserId: input.createdByUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ministry = new Ministry(ministryParams);
      const createdMinistry = await this.ministryRepository.create(ministry);

      const createdRoles: MinistryRole[] = [];

      for (const role of input.roles) {
        const roleParams: MinistryRoleParams = {
          ministryId: createdMinistry.id,
          name: role.name,
          createdByUserId: input.createdByUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const ministryRole = new MinistryRole(roleParams);
        const createdRole =
          await this.ministryRoleRepository.create(ministryRole);
        createdRoles.push(createdRole);
      }

      return {
        ok: true,
        value: {
          ministry: {
            id: createdMinistry.id,
            churchId: createdMinistry.churchId,
            name: createdMinistry.name,
            liderId: createdMinistry.liderId,
            minMembersPerService: createdMinistry.minMembersPerService,
            idealMembersPerService: createdMinistry.idealMembersPerService,
            notes: createdMinistry.notes,
            createdAt: createdMinistry.createdAt,
            roles: createdRoles.map((r) => ({
              id: r.id,
              name: r.name,
            })),
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: MinistryErrors.MINISTRY_CREATION_FAILED,
      };
    }
  }
}
