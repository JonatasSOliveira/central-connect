import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import { Service, type ServiceParams } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type {
  CreateServiceInput,
  CreateServiceOutput,
} from "../../dtos/service/CreateServiceDTO";
import { BaseUseCase } from "../BaseUseCase";

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export class CreateService extends BaseUseCase<
  CreateServiceInput & { churchId: string },
  CreateServiceOutput
> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(
    input: CreateServiceInput & { churchId: string },
  ): Promise<Result<CreateServiceOutput>> {
    try {
      const existingService =
        await this.serviceRepository.findByDateAndLocation(
          input.churchId,
          input.date,
          input.time,
          input.location ?? null,
        );

      if (existingService) {
        return {
          ok: false,
          error: {
            code: "SERVICE_DUPLICATE",
            message: "Já existe um culto nesta data, horário e local",
          },
        };
      }

      const dayOfWeek = DAY_OF_WEEK_MAP[input.date.getDay()];

      const serviceParams: ServiceParams = {
        churchId: input.churchId,
        serviceTemplateId: null,
        title: input.title,
        dayOfWeek,
        time: input.time,
        date: input.date,
        location: input.location ?? null,
        description: input.description ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const service = new Service(serviceParams);
      const createdService = await this.serviceRepository.create(service);

      return {
        ok: true,
        value: {
          id: createdService.id,
          churchId: createdService.churchId,
          serviceTemplateId: createdService.serviceTemplateId,
          title: createdService.title,
          date: createdService.date,
          time: createdService.time,
          location: createdService.location,
          description: createdService.description,
          createdAt: createdService.createdAt,
          updatedAt: createdService.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "CREATE_SERVICE_FAILED",
          message: "Falha ao criar culto",
        },
      };
    }
  }
}
