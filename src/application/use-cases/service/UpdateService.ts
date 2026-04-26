import type { DayOfWeek } from "@/domain/entities/DayOfWeek";
import { Service, type ServiceParams } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type { CreateServiceOutput } from "../../dtos/service/CreateServiceDTO";
import type { UpdateServiceInput } from "../../dtos/service/UpdateServiceDTO";
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

export class UpdateService extends BaseUseCase<
  UpdateServiceInput & { serviceId: string; churchId: string },
  CreateServiceOutput
> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(
    input: UpdateServiceInput & { serviceId: string; churchId: string },
  ): Promise<Result<CreateServiceOutput>> {
    try {
      const existingService = await this.serviceRepository.findById(
        input.serviceId,
      );

      if (!existingService) {
        return {
          ok: false,
          error: {
            code: "SERVICE_NOT_FOUND",
            message: "Culto não encontrado",
          },
        };
      }

      if (existingService.churchId !== input.churchId) {
        return {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Você não tem permissão para editar este culto",
          },
        };
      }

      const date = input.date ?? existingService.date;
      const time = input.time ?? existingService.time;
      const location =
        input.location !== undefined
          ? (input.location ?? null)
          : existingService.location;

      if (input.date || input.time || input.location !== undefined) {
        const duplicate = await this.serviceRepository.findByDateAndLocation(
          input.churchId,
          date,
          time,
          location,
        );

        if (duplicate && duplicate.id !== input.serviceId) {
          return {
            ok: false,
            error: {
              code: "SERVICE_DUPLICATE",
              message: "Já existe um culto nesta data, horário e local",
            },
          };
        }
      }

      const dayOfWeek = input.date
        ? DAY_OF_WEEK_MAP[input.date.getDay()]
        : existingService.dayOfWeek;

      const serviceParams: ServiceParams = {
        id: existingService.id,
        churchId: existingService.churchId,
        serviceTemplateId: existingService.serviceTemplateId,
        title: input.title ?? existingService.title,
        dayOfWeek,
        time,
        date,
        location,
        description:
          input.description !== undefined
            ? (input.description ?? null)
            : existingService.description,
        createdAt: existingService.createdAt,
        updatedAt: new Date(),
      };

      const service = new Service(serviceParams);
      const updatedService = await this.serviceRepository.update(service);

      return {
        ok: true,
        value: {
          id: updatedService.id,
          churchId: updatedService.churchId,
          serviceTemplateId: updatedService.serviceTemplateId,
          title: updatedService.title,
          date: updatedService.date,
          time: updatedService.time,
          location: updatedService.location,
          description: updatedService.description,
          createdAt: updatedService.createdAt,
          updatedAt: updatedService.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "UPDATE_SERVICE_FAILED",
          message: "Falha ao atualizar culto",
        },
      };
    }
  }
}
