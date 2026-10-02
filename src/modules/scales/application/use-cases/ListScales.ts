import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { ScaleSummaryDTO } from "../dtos/ScaleDTO";

export interface ListScalesInput {
  churchId: string;
  serviceId?: string;
  ministryId?: string;
}

export interface ListScalesOutput {
  scales: ScaleSummaryDTO[];
}

export class ListScales extends BaseUseCase<ListScalesInput, ListScalesOutput> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: ListScalesInput): Promise<Result<ListScalesOutput>> {
    try {
      const scales = await this.scaleRepository.findByFilters(input.churchId, {
        serviceId: input.serviceId,
        ministryId: input.ministryId,
      });
      const [ministries, members] = await Promise.all([
        this.ministryRepository.findByChurchId(input.churchId),
        this.scaleMemberRepository.findByScaleIds(scales.map((scale) => scale.id)),
      ]);
      const ministryNameById = new Map(
        ministries.map((ministry) => [ministry.id, ministry.name]),
      );
      const memberCountByScaleId = new Map<string, number>();
      for (const member of members) {
        memberCountByScaleId.set(
          member.scaleId,
          (memberCountByScaleId.get(member.scaleId) ?? 0) + 1,
        );
      }

      return {
        ok: true,
        value: {
          scales: scales.map((s) => ({
            id: s.id,
            serviceId: s.serviceId,
            ministryId: s.ministryId,
            ministryName:
              ministryNameById.get(s.ministryId) ?? "Ministério não encontrado",
            memberCount: memberCountByScaleId.get(s.id) ?? 0,
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
