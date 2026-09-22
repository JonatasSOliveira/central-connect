import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type { CreateScale } from "./CreateScale";

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
  constructor(
    private readonly churchRepository: IChurchRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly ministryRepository: IMinistryRepository,
    private readonly createScale: Pick<CreateScale, "execute">,
  ) {
    super();
  }

  async execute(input: ScheduledRunInput): Promise<Result<ScheduledRunOutput>> {
    try {
      const lookaheadDays = input.lookaheadDays ?? 7;
      if (
        !Number.isInteger(lookaheadDays) ||
        lookaheadDays < 1 ||
        lookaheadDays > 31
      ) {
        return {
          ok: false,
          error: {
            code: "INVALID_LOOKAHEAD_DAYS",
            message: "O período deve ser um número inteiro entre 1 e 31 dias",
          },
        };
      }
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + lookaheadDays);
      endDate.setHours(23, 59, 59, 999);

      const churchIds = input.churchIds ?? [];
      let allChurches = churchIds;

      if (allChurches.length === 0) {
        const churches = await this.churchRepository.findAll();
        allChurches = churches.map((c) => c.id);
      }

      const output: ScheduledRunOutput = {
        processedChurches: 0,
        processedServices: 0,
        autoAssignedCount: 0,
        errors: [],
      };

      for (const churchId of allChurches) {
        const services = await this.serviceRepository.findByDateRange(
          churchId,
          new Date(),
          endDate,
        );

        if (services.length === 0) continue;

        output.processedChurches++;

        const ministries =
          await this.ministryRepository.findByChurchId(churchId);

        for (const service of services) {
          for (const ministry of ministries) {
            output.processedServices++;

            const result = await this.createScale.execute({
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
              output.autoAssignedCount +=
                result.value.scale.members?.length ?? 0;
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
          message:
            error instanceof Error
              ? error.message
              : "Falha ao executar geração agendada",
        },
      };
    }
  }
}
