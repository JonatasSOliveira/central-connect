import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import { scaleContainer } from "@/infra/di/scale/container";

type ScheduledRunInput = {
  churchIds?: string[];
  lookaheadDays?: number;
};

type ScheduledRunOutput = {
  processedChurches: number;
  processedServices: number;
  autoAssignedCount: number;
  errors: string[];
};

export class RunScheduledScaleGeneration extends BaseUseCase<
  ScheduledRunInput,
  ScheduledRunOutput
> {
  constructor() {
    super();
  }

  async execute(input: ScheduledRunInput): Promise<Result<ScheduledRunOutput>> {
    try {
      const churchRepository = scaleContainer.churchRepository;
      const serviceRepository = scaleContainer.serviceRepository;
      const ministryRepository = scaleContainer.ministryRepository;
      const scaleRepository = scaleContainer.scaleRepository;
      const scaleMemberRepository = scaleContainer.scaleMemberRepository;
      const memberRepository = scaleContainer.memberRepository;
      const memberChurchRepository = scaleContainer.memberChurchRepository;
      const memberMinistryRepository = scaleContainer.memberMinistryRepository;
      const memberAvailabilityRepository = scaleContainer.memberAvailabilityRepository;
      const ministryRoleRepository = scaleContainer.ministryRoleRepository;

      const lookaheadDays = input.lookaheadDays ?? 7;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + lookaheadDays);
      endDate.setHours(23, 59, 59, 999);

      const churchIds = input.churchIds ?? [];
      let allChurches = churchIds;

      if (allChurches.length === 0) {
        const churches = await churchRepository.findAll();
        allChurches = churches.map((c) => c.id);
      }

      const output: ScheduledRunOutput = {
        processedChurches: 0,
        processedServices: 0,
        autoAssignedCount: 0,
        errors: [],
      };

      for (const churchId of allChurches) {
        const services = await serviceRepository.findByDateRange(
          churchId,
          new Date(),
          endDate,
        );

        if (services.length === 0) continue;

        output.processedChurches++;

        const ministries = await ministryRepository.findByChurchId(churchId);

        for (const service of services) {
          for (const ministry of ministries) {
            output.processedServices++;

            const createScale = scaleContainer.createScale;

            const result = await createScale.execute({
              churchId,
              serviceId: service.id,
              ministryId: ministry.id,
              status: "draft",
              notes: null,
              members: [],
              autoAssignMembers: true,
              createdByUserId: "scheduler",
            });

            if (result.ok) {
              output.autoAssignedCount += result.value.scale.members?.length ?? 0;
            } else if (result.error?.code !== "SCALE_ALREADY_EXISTS") {
              output.errors.push(
                `${service.title}/${ministry.name}: ${result.error?.message}`,
              );
            }
          }
        }
      }

      return { ok: true, value: output };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "SCHEDULED_RUN_FAILED",
          message: error instanceof Error
            ? error.message
            : "Falha ao executar geração agendada",
        },
      };
    }
  }
}