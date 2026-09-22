import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/modules/scales/domain/entities/ScaleMember";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { ScaleMemberDTO } from "../dtos/ScaleDTO";
import { ScaleErrors } from "../errors/ScaleErrors";

export interface AddMemberToScaleInput {
  scaleId: string;
  memberId: string;
  ministryRoleId: string;
  notes?: string | null;
}

export interface AddMemberToScaleOutput {
  member: ScaleMemberDTO;
}

export class AddMemberToScale extends BaseUseCase<
  AddMemberToScaleInput,
  AddMemberToScaleOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(
    input: AddMemberToScaleInput,
  ): Promise<Result<AddMemberToScaleOutput>> {
    try {
      const scale = await this.scaleRepository.findById(input.scaleId);

      if (!scale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_NOT_FOUND,
        };
      }

      const memberParams: ScaleMemberParams = {
        scaleId: input.scaleId,
        memberId: input.memberId,
        ministryRoleId: input.ministryRoleId,
        notes: input.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdMember = await this.scaleMemberRepository.create(
        new ScaleMember(memberParams),
      );

      return {
        ok: true,
        value: {
          member: {
            id: createdMember.id,
            memberId: createdMember.memberId,
            ministryRoleId: createdMember.ministryRoleId,
            notes: createdMember.notes,
          },
        },
      };
    } catch {
      return {
        ok: false,
        error: ScaleErrors.SCALE_UPDATE_FAILED,
      };
    }
  }
}
