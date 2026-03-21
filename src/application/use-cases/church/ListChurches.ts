import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { Result } from "@/shared/types/Result";
import type { ChurchListItemDTO } from "../../dtos/church/ChurchDTO";
import { BaseUseCase } from "../BaseUseCase";

export interface ListChurchesOutput {
  churches: ChurchListItemDTO[];
}

export class ListChurches extends BaseUseCase<void, ListChurchesOutput> {
  constructor(private readonly churchRepository: IChurchRepository) {
    super();
  }

  async execute(): Promise<Result<ListChurchesOutput>> {
    try {
      const churches = await this.churchRepository.findAll();

      const churchDTOs: ChurchListItemDTO[] = churches.map((church) => ({
        id: church.id,
        name: church.name,
      }));

      return {
        ok: true,
        value: {
          churches: churchDTOs,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao listar igrejas",
        },
      };
    }
  }
}
