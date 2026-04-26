import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { MinistryDetailDTO } from "../../dtos/ministry/MinistryDTO";
import { MinistryErrors } from "../../errors/MinistryErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface GetMinistryInput {
  ministryId: string;
}

export interface GetMinistryOutput {
  ministry: MinistryDetailDTO;
}

export class GetMinistry extends BaseUseCase<
  GetMinistryInput,
  GetMinistryOutput
> {
  constructor(
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
  ) {
    super();
  }

  async execute(input: GetMinistryInput): Promise<Result<GetMinistryOutput>> {
    try {
      const ministry = await this.ministryRepository.findById(input.ministryId);

      if (!ministry) {
        return {
          ok: false,
          error: MinistryErrors.MINISTRY_NOT_FOUND,
        };
      }

      const roles = await this.ministryRoleRepository.findByMinistryId(
        ministry.id,
      );

      return {
        ok: true,
        value: {
          ministry: {
            id: ministry.id,
            churchId: ministry.churchId,
            name: ministry.name,
            leaderId: ministry.leaderId,
            notes: ministry.notes,
            createdAt: ministry.createdAt,
            roles: roles.map((r) => ({
              id: r.id,
              name: r.name,
              requiredCount: r.requiredCount,
            })),
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: MinistryErrors.MINISTRY_NOT_FOUND,
      };
    }
  }
}
