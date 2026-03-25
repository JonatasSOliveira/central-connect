import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { Result } from "@/shared/types/Result";
import type { MinistryListItemDTO } from "../../dtos/ministry/MinistryDTO";
import { BaseUseCase } from "../BaseUseCase";

export interface ListMinistriesInput {
  churchId?: string;
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
  ) {
    super();
  }

  async execute(
    input: ListMinistriesInput,
  ): Promise<Result<ListMinistriesOutput>> {
    try {
      const ministries = input.churchId
        ? await this.ministryRepository.findByChurchId(input.churchId)
        : await this.ministryRepository.findAll();

      const ministryDTOs: MinistryListItemDTO[] = await Promise.all(
        ministries.map(async (ministry) => {
          const roles = await this.ministryRoleRepository.findByMinistryId(
            ministry.id,
          );

          return {
            id: ministry.id,
            churchId: ministry.churchId,
            name: ministry.name,
            liderId: ministry.liderId,
            roles: roles.map((r) => ({
              id: r.id,
              name: r.name,
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
