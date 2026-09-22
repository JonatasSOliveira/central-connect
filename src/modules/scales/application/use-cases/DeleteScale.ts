import type { IScaleAttendanceMemberRepository } from "@/modules/scales/application/ports/IScaleAttendanceMemberRepository";
import type { IScaleAttendanceRepository } from "@/modules/scales/application/ports/IScaleAttendanceRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { ScaleErrors } from "../errors/ScaleErrors";

export interface DeleteScaleInput {
  scaleId: string;
}

export class DeleteScale extends BaseUseCase<DeleteScaleInput, void> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly scaleAttendanceRepository: IScaleAttendanceRepository,
    private readonly scaleAttendanceMemberRepository: IScaleAttendanceMemberRepository,
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
      await this.scaleAttendanceMemberRepository.deleteByScaleId(input.scaleId);

      const attendance = await this.scaleAttendanceRepository.findByScaleId(
        input.scaleId,
      );
      if (attendance) {
        await this.scaleAttendanceRepository.delete(attendance.id);
      }

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
