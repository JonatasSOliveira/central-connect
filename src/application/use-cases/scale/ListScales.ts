import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { Result } from "@/shared/types/Result";
import type { ScaleListItemDTO } from "../../dtos/scale/ScaleDTO";
import { BaseUseCase } from "../BaseUseCase";

export interface ListScalesInput {
  churchId: string;
  serviceId?: string;
  ministryId?: string;
}

export interface ListScalesOutput {
  scales: ScaleListItemDTO[];
}

export class ListScales extends BaseUseCase<ListScalesInput, ListScalesOutput> {
  constructor(private readonly scaleRepository: IScaleRepository) {
    super();
  }

  async execute(input: ListScalesInput): Promise<Result<ListScalesOutput>> {
    try {
      const scales = await this.scaleRepository.findByFilters(input.churchId, {
        serviceId: input.serviceId,
        ministryId: input.ministryId,
      });

      return {
        ok: true,
        value: {
          scales: scales.map((s) => ({
            id: s.id,
            churchId: s.churchId,
            serviceId: s.serviceId,
            ministryId: s.ministryId,
            status: s.status,
            notes: s.notes,
          })),
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao listar escalas",
        },
      };
    }
  }
}
