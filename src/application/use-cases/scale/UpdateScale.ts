import { Scale, type ScaleParams } from "@/domain/entities/Scale";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/domain/entities/ScaleMember";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { Result } from "@/shared/types/Result";
import type { ScaleDetailDTO } from "../../dtos/scale/ScaleDTO";
import { ScaleErrors } from "../../errors/ScaleErrors";
import { BaseUseCase } from "../BaseUseCase";

export interface UpdateScaleMemberInput {
  id: string | null;
  memberId: string;
  ministryRoleId: string;
  notes?: string | null;
}

export interface UpdateScaleInput {
  scaleId: string;
  churchId: string;
  serviceId: string;
  ministryId: string;
  status: "draft" | "published";
  notes?: string | null;
  members: UpdateScaleMemberInput[];
  updatedByUserId: string;
}

export interface UpdateScaleOutput {
  scale: ScaleDetailDTO;
}

export class UpdateScale extends BaseUseCase<
  UpdateScaleInput,
  UpdateScaleOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: UpdateScaleInput): Promise<Result<UpdateScaleOutput>> {
    try {
      const existingScale = await this.scaleRepository.findById(input.scaleId);

      if (!existingScale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_NOT_FOUND,
        };
      }

      const duplicateScale =
        await this.scaleRepository.findByServiceAndMinistry(
          input.churchId,
          input.serviceId,
          input.ministryId,
          existingScale.id,
        );

      if (duplicateScale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_ALREADY_EXISTS,
        };
      }

      const scaleParams: ScaleParams = {
        id: existingScale.id,
        churchId: existingScale.churchId,
        serviceId: input.serviceId,
        ministryId: input.ministryId,
        status: input.status,
        notes: input.notes ?? null,
        createdByUserId: existingScale.createdByUserId ?? null,
        createdAt: existingScale.createdAt,
        updatedAt: new Date(),
        updatedByUserId: input.updatedByUserId,
      };

      const scale = new Scale(scaleParams);
      const updatedScale = await this.scaleRepository.update(scale);

      const existingMembers = await this.scaleMemberRepository.findByScaleId(
        updatedScale.id,
      );

      const inputMemberIds = new Set(
        input.members.filter((m) => m.id).map((m) => m.id),
      );

      const membersToDelete = existingMembers.filter(
        (m) => !inputMemberIds.has(m.id),
      );
      for (const member of membersToDelete) {
        await this.scaleMemberRepository.delete(member.id);
      }

      const finalMembers = [];

      for (const memberInput of input.members) {
        if (memberInput.id) {
          const existingMember = existingMembers.find(
            (m) => m.id === memberInput.id,
          );
          if (existingMember) {
            if (
              existingMember.memberId !== memberInput.memberId ||
              existingMember.ministryRoleId !== memberInput.ministryRoleId ||
              existingMember.notes !== (memberInput.notes ?? null)
            ) {
              const memberParams: ScaleMemberParams = {
                id: existingMember.id,
                scaleId: existingMember.scaleId,
                memberId: memberInput.memberId,
                ministryRoleId: memberInput.ministryRoleId,
                notes: memberInput.notes ?? null,
                createdAt: existingMember.createdAt,
                updatedAt: new Date(),
              };
              const member = new ScaleMember(memberParams);
              const updatedMember =
                await this.scaleMemberRepository.update(member);
              finalMembers.push(updatedMember);
            } else {
              finalMembers.push(existingMember);
            }
          }
        } else {
          const memberParams: ScaleMemberParams = {
            scaleId: updatedScale.id,
            memberId: memberInput.memberId,
            ministryRoleId: memberInput.ministryRoleId,
            notes: memberInput.notes ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const member = new ScaleMember(memberParams);
          const createdMember = await this.scaleMemberRepository.create(member);
          finalMembers.push(createdMember);
        }
      }

      return {
        ok: true,
        value: {
          scale: {
            id: updatedScale.id,
            churchId: updatedScale.churchId,
            serviceId: updatedScale.serviceId,
            ministryId: updatedScale.ministryId,
            status: updatedScale.status,
            notes: updatedScale.notes,
            createdAt: updatedScale.createdAt,
            updatedAt: updatedScale.updatedAt,
            members: finalMembers.map((m) => ({
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
        error: ScaleErrors.SCALE_UPDATE_FAILED,
      };
    }
  }
}
