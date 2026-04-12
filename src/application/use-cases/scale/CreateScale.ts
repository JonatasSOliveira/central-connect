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

export interface CreateScaleInput {
  churchId: string;
  serviceId: string;
  ministryId: string;
  status?: "draft" | "published";
  notes?: string | null;
  members?: {
    memberId: string;
    ministryRoleId: string;
    notes?: string | null;
  }[];
  createdByUserId: string;
}

export interface CreateScaleOutput {
  scale: ScaleDetailDTO;
}

export class CreateScale extends BaseUseCase<
  CreateScaleInput,
  CreateScaleOutput
> {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {
    super();
  }

  async execute(input: CreateScaleInput): Promise<Result<CreateScaleOutput>> {
    try {
      const existingScale = await this.scaleRepository.findByServiceAndMinistry(
        input.churchId,
        input.serviceId,
        input.ministryId,
      );

      if (existingScale) {
        return {
          ok: false,
          error: ScaleErrors.SCALE_ALREADY_EXISTS,
        };
      }

      const scaleParams: ScaleParams = {
        churchId: input.churchId,
        serviceId: input.serviceId,
        ministryId: input.ministryId,
        status: input.status ?? "draft",
        notes: input.notes ?? null,
        createdByUserId: input.createdByUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scale = new Scale(scaleParams);
      const createdScale = await this.scaleRepository.create(scale);

      const createdMembers = [];

      for (const member of input.members ?? []) {
        const memberParams: ScaleMemberParams = {
          scaleId: createdScale.id,
          memberId: member.memberId,
          ministryRoleId: member.ministryRoleId,
          notes: member.notes ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const scaleMember = new ScaleMember(memberParams);
        const createdMember =
          await this.scaleMemberRepository.create(scaleMember);
        createdMembers.push(createdMember);
      }

      return {
        ok: true,
        value: {
          scale: {
            id: createdScale.id,
            serviceId: createdScale.serviceId,
            ministryId: createdScale.ministryId,
            status: createdScale.status,
            notes: createdScale.notes,
            createdAt: createdScale.createdAt,
            updatedAt: createdScale.updatedAt,
            members: createdMembers.map((m) => ({
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
        error: ScaleErrors.SCALE_CREATION_FAILED,
      };
    }
  }
}
