import type { Service } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type {
  ListServicesOutput,
  ListServicesQuery,
  ServiceListItem,
} from "../../dtos/service/ListServicesDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListServices extends BaseUseCase<
  ListServicesQuery,
  ListServicesOutput
> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(input: ListServicesQuery): Promise<Result<ListServicesOutput>> {
    try {
      let services: Service[];

      if (input.startDate && input.endDate) {
        services = await this.serviceRepository.findByDateRange(
          input.churchId,
          input.startDate,
          input.endDate,
        );
      } else {
        services = await this.serviceRepository.findByChurchId(input.churchId);
      }

      const serviceDTOs: ServiceListItem[] = services.map(
        (service: Service) => ({
          id: service.id,
          churchId: service.churchId,
          serviceTemplateId: service.serviceTemplateId,
          title: service.title,
          date: service.date,
          time: service.time,
          shift: service.shift,
          location: service.location,
          description: service.description,
        }),
      );

      return {
        ok: true,
        value: {
          services: serviceDTOs,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "LIST_SERVICES_FAILED",
          message: "Falha ao listar cultos",
        },
      };
    }
  }
}
