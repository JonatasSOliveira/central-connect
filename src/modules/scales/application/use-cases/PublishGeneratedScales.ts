import type { IScaleGenerationContextReader } from "../ports/generation/IScaleGenerationContextReader";
import type { IScaleMemberRepository } from "../ports/IScaleMemberRepository";
import type { IScaleRepository } from "../ports/IScaleRepository";
import type {
  SaveGeneratedScale,
  SaveGeneratedScaleUseCaseOutput,
} from "./SaveGeneratedScale";
import { ScaleGenerationErrors } from "../errors/ScaleGenerationErrors";
import type { Result } from "@/shared/types/Result";
import type { ScaleGenerationConfirmation } from "../ports/generation/IScaleGenerationWriter";

export type PublishGeneratedScalesInput = {
  churchId: string;
  serviceId: string;
  scaleIds: string[];
  publishedByUserId: string;
  confirmations?: ScaleGenerationConfirmation[];
};

export class PublishGeneratedScales {
  constructor(
    private readonly scaleRepository: IScaleRepository,
    private readonly scaleMemberRepository: IScaleMemberRepository,
    private readonly contextReader: IScaleGenerationContextReader,
    private readonly saveGeneratedScale: Pick<SaveGeneratedScale, "execute">,
  ) {}

  async execute(
    input: PublishGeneratedScalesInput,
  ): Promise<Result<SaveGeneratedScaleUseCaseOutput>> {
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

    const ministries = await Promise.all(
      existingScales.map(async (scale) => ({
        ministryId: scale.ministryId,
        assignments: (await this.scaleMemberRepository.findByScaleId(scale.id)).map(
          (member) => ({
            memberId: member.memberId,
            ministryRoleId: member.ministryRoleId,
          }),
        ),
      })),
    );

    return this.saveGeneratedScale.execute({
      churchId: input.churchId,
      serviceId: input.serviceId,
      ministries,
      status: "published",
      mode: "preserve-existing",
      actorUserId: input.publishedByUserId,
      confirmations: input.confirmations,
    });
  }
}
