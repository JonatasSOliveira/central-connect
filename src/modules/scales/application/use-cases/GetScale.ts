import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { ScaleDetailDTO } from "../dtos/ScaleDTO";
import { ScaleErrors } from "../errors/ScaleErrors";

export interface GetScaleInput {
  scaleId: string;
}

export interface GetScaleOutput {
  scale: ScaleDetailDTO;
}

export class GetScale extends BaseUseCase<GetScaleInput, GetScaleOutput> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: GetScaleInput): Promise<Result<GetScaleOutput>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);

      if (!scale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_NOT_FOUND,
        };
      }

      const members = await this.scaleMemberRepository.findByScaleId(scale.id);

      return {
        ok: true,
        value: {
          scale: {
            id: scale.id,
            churchId: scale.churchId,
            serviceId: scale.serviceId,
            ministryId: scale.ministryId,
            status: scale.status,
            notes: scale.notes,
            createdAt: scale.createdAt,
            updatedAt: scale.updatedAt,
            members: members.map((m) => ({
              id: m.id,
              memberId: m.memberId,
              ministryRoleId: m.ministryRoleId,
              notes: m.notes,
            })),
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: ScaleErrors.SCALE_NOT_FOUND,
      };
    }
  }
}
