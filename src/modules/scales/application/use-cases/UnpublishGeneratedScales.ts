import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleRepository } from "../ports/IScaleRepository";
import { Scale } from "../../domain/entities/Scale";
import { ScaleGenerationErrors } from "../errors/ScaleGenerationErrors";
import type { Result } from "@/shared/types/Result";

export type UnpublishGeneratedScalesInput = {
  churchId: string;
  serviceId: string;
  scaleIds: string[];
  unpublishedByUserId: string;
};

export type UnpublishGeneratedScalesOutput = {
  scaleIds: string[];
};

export class UnpublishGeneratedScales {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly contextReader: IScaleGenerationContextReader,
  ) {}

  async execute(
    input: UnpublishGeneratedScalesInput,
  ): Promise<Result<UnpublishGeneratedScalesOutput>> {
    const scaleIds = [...new Set(input.scaleIds)];
    if (scaleIds.length === 0) {
      return { ok: false, error: ScaleGenerationErrors.SCALES_REQUIRED };
    }
    const service = await this.contextReader.findService(
      input.churchId,
      input.serviceId,
    );
    if (!service) {
      return { ok: false, error: ScaleGenerationErrors.CONTEXT_INVALID };
    }
    const scales = await Promise.all(
      scaleIds.map((scaleId) => this.scaleRepository.findById(scaleId)),
    );
    if (scales.some((scale) => !scale)) {
      return { ok: false, error: ScaleGenerationErrors.SCALE_NOT_FOUND };
    }
    const existingScales = scales.filter(
      (scale): scale is NonNullable<typeof scale> => Boolean(scale),
    );
    if (existingScales.some((scale) => scale.serviceId !== service.service.id)) {
      return { ok: false, error: ScaleGenerationErrors.SERVICE_MISMATCH };
    }

    for (const scale of existingScales) {
      await this.scaleRepository.update(
        new Scale({
          id: scale.id,
          serviceId: scale.serviceId,
          ministryId: scale.ministryId,
          status: "draft",
          notes: scale.notes,
          createdByUserId: scale.createdByUserId,
          updatedByUserId: input.unpublishedByUserId,
          createdAt: scale.createdAt,
          updatedAt: new Date(),
          deletedAt: scale.deletedAt,
          publishedAt: null,
          publishedByUserId: null,
        }),
      );
    }
    return { ok: true, value: { scaleIds } };
  }
}
