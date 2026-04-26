import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { MinistryListItemDTO } from "../../dtos/ministry/MinistryDTO";
import { BaseUseCase } from "../BaseUseCase";

export interface ListMinistriesInput {
  churchId?: string;
  excludeServiceId?: string;
  excludeScaleId?: string;
}

export interface ListMinistriesOutput {
  ministries: MinistryListItemDTO[];
}

export class ListMinistries extends BaseUseCase<
  ListMinistriesInput,
  ListMinistriesOutput
> {
  constructor(
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
    private readonly scaleRepository?: IScaleRepository,
  ) {
    super();
  }

  async execute(
    input: ListMinistriesInput,
  ): Promise<Result<ListMinistriesOutput>> {
    try {
      let ministries = input.churchId
        ? await this.ministryRepository.findByChurchId(input.churchId)
        : await this.ministryRepository.findAll();

      if (input.excludeServiceId && this.scaleRepository) {
        const scales = await this.scaleRepository.findByFilters(
          input.churchId || "",
          {
            serviceId: input.excludeServiceId,
          },
        );

        const existingMinistryIds = new Set(
          scales
            .filter((scale) => scale.id !== input.excludeScaleId)
            .map((scale) => scale.ministryId),
        );

        ministries = ministries.filter((m) => !existingMinistryIds.has(m.id));
      }

      const ministryDTOs: MinistryListItemDTO[] = await Promise.all(
        ministries.map(async (ministry) => {
          const roles = await this.ministryRoleRepository.findByMinistryId(
            ministry.id,
          );

          return {
            id: ministry.id,
            churchId: ministry.churchId,
            name: ministry.name,
            leaderId: ministry.leaderId,
            roles: roles.map((r) => ({
              id: r.id,
              name: r.name,
              requiredCount: r.requiredCount,
            })),
          };
        }),
      );

      return {
        ok: true,
        value: {
          ministries: ministryDTOs,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao listar ministérios",
        },
      };
    }
  }
}
