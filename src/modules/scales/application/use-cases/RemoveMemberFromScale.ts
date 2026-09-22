import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { ScaleErrors } from "../errors/ScaleErrors";

export interface RemoveMemberFromScaleInput {
  scaleId: string;
  scaleMemberId: string;
}

export class RemoveMemberFromScale extends BaseUseCase<
  RemoveMemberFromScaleInput,
  void
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: RemoveMemberFromScaleInput): Promise<Result<void>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);

      if (!scale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_NOT_FOUND,
        };
      }

      const scaleMember = await this.scaleMemberRepository.findById(
        input.scaleMemberId,
      );

      if (!scaleMember || scaleMember.scaleId !== input.scaleId) {
        return {
          ok: false,
          error: ScaleErrors.MEMBER_NOT_FOUND,
        };
      }

      await this.scaleMemberRepository.delete(scaleMember.id);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: ScaleErrors.SCALE_UPDATE_FAILED,
      };
    }
  }
}
