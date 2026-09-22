import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { Church } from "@/modules/churches/domain/entities/Church";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { ChurchListItemDTO } from "../dtos/church/ChurchDTO";

export interface ListChurchesInput {
  isSuperAdmin: boolean;
  userChurchIds?: string[];
}

export interface ListChurchesOutput {
  churches: ChurchListItemDTO[];
}

export class ListChurches extends BaseUseCase<
  ListChurchesInput,
  ListChurchesOutput
> {
  constructor(private readonly churchRepository: IChurchRepository) {
    super();
  }

  async execute(input: ListChurchesInput): Promise<Result<ListChurchesOutput>> {
    try {
      let churches: Church[];

      if (input.isSuperAdmin) {
        churches = await this.churchRepository.findAll();
      } else if (input.userChurchIds && input.userChurchIds.length > 0) {
        churches = await this.churchRepository.findByIds(input.userChurchIds);
      } else {
        churches = [];
      }

      const churchDTOs: ChurchListItemDTO[] = churches.map((church) => ({
        id: church.id,
        name: church.name,
        selfSignupDefaultRoleId: church.selfSignupDefaultRoleId,
        maxConsecutiveScalesPerMember: church.maxConsecutiveScalesPerMember,
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
