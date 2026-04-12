import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { Result } from "@/shared/types/Result";
import { ScaleErrors } from "../../errors/ScaleErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface DeleteScaleInput {
  scaleId: string;
}

export class DeleteScale extends BaseUseCase<DeleteScaleInput, void> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: DeleteScaleInput): Promise<Result<void>> {
    try {
      const existingScale = await this.scaleRepository.findById(input.scaleId);

      if (!existingScale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_NOT_FOUND,
        };
      }

      await this.scaleMemberRepository.deleteByScaleId(input.scaleId);

      await this.scaleRepository.delete(input.scaleId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: ScaleErrors.SCALE_DELETE_FAILED,
      };
    }
  }
}
