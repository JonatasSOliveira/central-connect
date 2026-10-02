import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/modules/scales/domain/entities/ScaleMember";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { ScaleMemberDTO } from "../dtos/ScaleDTO";
import { ScaleErrors } from "../errors/ScaleErrors";
import { validateScaleContext } from "./helpers/validateScaleContext";

export interface AddMemberToScaleInput {
  scaleId: string;
  churchId: string;
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
    private readonly churchRepository: IChurchRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberMinistryRoleRepository: IMemberMinistryRoleRepository,
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

      if (
        await this.scaleMemberRepository.findByScaleId(input.scaleId).then(
          (members) =>
            members.some(
              (member) =>
                member.memberId === input.memberId &&
                member.ministryRoleId === input.ministryRoleId,
            ),
        )
      ) {
        return { ok: false, error: ScaleErrors.DUPLICATE_SCALE_MEMBER };
      }

      const contextError = await validateScaleContext(
        {
          churchRepository: this.churchRepository,
          serviceRepository: this.serviceRepository,
          ministryRepository: this.ministryRepository,
          ministryRoleRepository: this.ministryRoleRepository,
          memberRepository: this.memberRepository,
          memberChurchRepository: this.memberChurchRepository,
          memberMinistryRepository: this.memberMinistryRepository,
          memberMinistryRoleRepository: this.memberMinistryRoleRepository,
        },
        {
          churchId: input.churchId,
          serviceId: scale.serviceId,
          ministryId: scale.ministryId,
          members: [
            {
              memberId: input.memberId,
              ministryRoleId: input.ministryRoleId,
            },
          ],
        },
      );
      if (contextError) {
        return {
          ok: false,
          error:
            ScaleErrors[contextError as keyof typeof ScaleErrors] ??
            ScaleErrors.SCALE_UPDATE_FAILED,
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
