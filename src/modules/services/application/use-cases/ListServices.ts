import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import type { Service } from "@/modules/services/domain/entities/Service";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  ListServicesOutput,
  ListServicesQuery,
  ServiceListItem,
} from "../dtos/service/ListServicesDTO";

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
