import { Scale, type ScaleParams } from "@/domain/entities/Scale";
import {
  ScaleMember,
  type ScaleMemberParams,
} from "@/domain/entities/ScaleMember";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IMemberAvailabilityRepository } from "@/domain/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/domain/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IMinistryRoleRepository } from "@/domain/ports/IMinistryRoleRepository";
import type { IScaleRepository } from "@/domain/ports/IScaleRepository";
import type { IScaleMemberRepository } from "@/domain/ports/IScaleMemberRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type { ScaleDetailDTO } from "../../dtos/scale/ScaleDTO";
import { ScaleErrors } from "../../errors/ScaleErrors";
import { autoAssignScaleMembers } from "./autoAssignScaleMembers";
import { BaseUseCase } from "../BaseUseCase";

export interface CreateScaleInput {
  churchId: string;
  serviceId: string;
  ministryId: string;
  status?: "draft" | "published";
  notes?: string | null;
  autoAssignMembers?: boolean;
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
    private readonly churchRepository: IChurchRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRoleRepository: IMinistryRoleRepository,
    private readonly memberRepository: IMemberRepository,
    private readonly memberChurchRepository: IMemberChurchRepository,
    private readonly memberMinistryRepository: IMemberMinistryRepository,
    private readonly memberAvailabilityRepository: IMemberAvailabilityRepository,
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

      const shouldAutoAssign = input.autoAssignMembers ?? false;
      const membersToCreate =
        input.members && input.members.length > 0
          ? input.members
          : shouldAutoAssign
            ? await autoAssignScaleMembers(
                {
                  churchRepository: this.churchRepository,
                  memberAvailabilityRepository:
                    this.memberAvailabilityRepository,
                  memberChurchRepository: this.memberChurchRepository,
                  memberMinistryRepository: this.memberMinistryRepository,
                  memberRepository: this.memberRepository,
                  ministryRoleRepository: this.ministryRoleRepository,
                  scaleMemberRepository: this.scaleMemberRepository,
                  scaleRepository: this.scaleRepository,
                  serviceRepository: this.serviceRepository,
                },
                {
                  churchId: input.churchId,
                  ministryId: input.ministryId,
                  serviceId: input.serviceId,
                },
              )
            : [];

      const createdMembers = [];

      for (const member of membersToCreate) {
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
            churchId: createdScale.churchId,
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
