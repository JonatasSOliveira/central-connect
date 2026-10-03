import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import type {
  IScaleGenerationWriter,
  SaveGeneratedScaleInput,
  SavedGeneratedScale,
} from "@/modules/scales/application/ports/generation/IScaleGenerationWriter";
import type { IScaleMemberRepository } from "@/modules/scales/application/ports/IScaleMemberRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import { Scale, type ScaleStatus } from "@/modules/scales/domain/entities/Scale";
import { ScaleMember } from "@/modules/scales/domain/entities/ScaleMember";

export class ScaleGenerationWriter implements IScaleGenerationWriter {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
  ) {}

  async save(input: SaveGeneratedScaleInput): Promise<SavedGeneratedScale[]> {
    const memberIds = input.ministries.flatMap((ministry) =>
      ministry.assignments.map((assignment) => assignment.memberId),
    );
    if (new Set(memberIds).size !== memberIds.length) {
      throw new Error("SCALE_GENERATION_DUPLICATE_MEMBER");
    }

    const saved: SavedGeneratedScale[] = [];
    for (const ministry of input.ministries) {
      const existing = await this.scaleRepository.findByServiceAndMinistry(
        input.serviceId,
        ministry.ministryId,
      );
      const scale = existing
        ? await this.updateScale(existing, input.status, input.actorUserId)
        : await this.createScale(input, ministry.ministryId);

      const existingMembers = await this.scaleMemberRepository.findByScaleId(
        scale.id,
      );
      if (input.mode === "replace-existing") {
        await this.scaleMemberRepository.deleteByScaleId(scale.id);
      }

      const existingMemberIds = new Set(
        input.mode === "preserve-existing"
          ? existingMembers.map((member) => member.memberId)
          : [],
      );
      for (const assignment of ministry.assignments) {
        if (existingMemberIds.has(assignment.memberId)) continue;
        await this.scaleMemberRepository.create(
          new ScaleMember({
            scaleId: scale.id,
            memberId: assignment.memberId,
            ministryRoleId: assignment.ministryRoleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      }

      const members = await this.scaleMemberRepository.findByScaleId(scale.id);
      saved.push({
        scaleId: scale.id,
        ministryId: ministry.ministryId,
        memberCount: members.length,
        status: scale.status,
      });
    }
    return saved;
  }

  private async createScale(
    input: SaveGeneratedScaleInput,
    ministryId: string,
  ): Promise<Scale> {
    return this.scaleRepository.create(
      new Scale({
        serviceId: input.serviceId,
        ministryId,
        status: input.status,
        publishedAt: input.status === "published" ? new Date() : null,
        publishedByUserId: input.status === "published" ? input.actorUserId : null,
        createdByUserId: input.actorUserId,
        updatedByUserId: input.actorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }

  private async updateScale(
    existing: Scale,
    status: ScaleStatus,
    actorUserId: string,
  ): Promise<Scale> {
    return this.scaleRepository.update(
      new Scale({
        id: existing.id,
        serviceId: existing.serviceId,
        ministryId: existing.ministryId,
        status,
        notes: existing.notes,
        createdByUserId: existing.createdByUserId,
        updatedByUserId: actorUserId,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
        deletedAt: existing.deletedAt,
        publishedAt: status === "published" ? new Date() : null,
        publishedByUserId: status === "published" ? actorUserId : null,
      }),
    );
  }
}

export type ScaleGenerationWriterFactory = (
  executor: DatabaseExecutor,
) => ScaleGenerationWriter;
