import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type { CreateServiceOutput } from "../../dtos/service/CreateServiceDTO";
import { BaseUseCase } from "../BaseUseCase";

export class GetService extends BaseUseCase<
  { serviceId: string; churchId: string },
  CreateServiceOutput
> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(input: {
    serviceId: string;
    churchId: string;
  }): Promise<Result<CreateServiceOutput>> {
    try {
      const service = await this.serviceRepository.findById(input.serviceId);

      if (!service) {
        return {
          ok: false,
          error: {
            code: "SERVICE_NOT_FOUND",
            message: "Culto não encontrado",
          },
        };
      }

      if (service.churchId !== input.churchId) {
        return {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Você não tem permissão para visualizar este culto",
          },
        };
      }

      return {
        ok: true,
        value: {
          id: service.id,
          churchId: service.churchId,
          serviceTemplateId: service.serviceTemplateId,
          title: service.title,
          date: service.date,
          time: service.time,
          shift: service.shift,
          location: service.location,
          description: service.description,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GET_SERVICE_FAILED",
          message: "Falha ao obter culto",
        },
      };
    }
  }
}
