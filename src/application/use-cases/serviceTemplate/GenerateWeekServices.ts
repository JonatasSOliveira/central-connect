import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import { Service, type ServiceParams } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import type { GenerateWeekOutput } from "../../dtos/serviceTemplate/GenerateWeekDTO";
import { BaseUseCase } from "../BaseUseCase";

const DAY_OF_WEEK_TO_NUMBER: Record<DayOfWeek, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export class GenerateWeekServices extends BaseUseCase<
  { churchId: string; weekStartDate: Date },
  GenerateWeekOutput
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {
    super();
  }

  async execute(input: {
    churchId: string;
    weekStartDate: Date;
  }): Promise<Result<GenerateWeekOutput>> {
    try {
      const templates =
        await this.serviceTemplateRepository.findActiveByChurchId(
          input.churchId,
        );

      if (templates.length === 0) {
        return {
          ok: false,
          error: {
            code: "NO_ACTIVE_TEMPLATES",
            message: "Não há modelos de culto ativos para gerar",
          },
        };
      }

      const weekDates: Date[] = [];
      const startDate = new Date(input.weekStartDate);
      startDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        weekDates.push(date);
      }

      const createdServices: GenerateWeekOutput["services"] = [];
      let skippedCount = 0;

      for (const template of templates) {
        const templateDayNumber = DAY_OF_WEEK_TO_NUMBER[template.dayOfWeek];
        const matchingDate = weekDates.find(
          (date) => date.getDay() === templateDayNumber,
        );

        if (!matchingDate) continue;

        const existingService =
          await this.serviceRepository.findByDateAndLocation(
            input.churchId,
            matchingDate,
            template.time,
            template.location,
          );

        if (existingService) {
          skippedCount++;
          continue;
        }

        const title = `${template.title} - ${formatDate(matchingDate)}`;

        const serviceParams: ServiceParams = {
          churchId: input.churchId,
          serviceTemplateId: template.id,
          title,
          dayOfWeek: template.dayOfWeek,
          shift: template.shift,
          time: template.time,
          date: matchingDate,
          location: template.location,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const service = new Service(serviceParams);
        const createdService = await this.serviceRepository.create(service);

        createdServices.push({
          id: createdService.id,
          title: createdService.title,
          date: createdService.date,
          time: createdService.time,
        });
      }

      return {
        ok: true,
        value: {
          createdCount: createdServices.length,
          skippedCount,
          services: createdServices,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GENERATE_WEEK_FAILED",
          message: "Falha ao gerar cultos da semana",
        },
      };
    }
  }
}
