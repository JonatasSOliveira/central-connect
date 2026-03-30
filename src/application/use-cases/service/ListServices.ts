import type { Service } from "@/domain/entities/Service";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import type { ListServicesQuery } from "../../dtos/service/ListServicesDTO";
import { BaseUseCase } from "../BaseUseCase";

export class ListServices extends BaseUseCase<ListServicesQuery, Service[]> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(input: ListServicesQuery): Promise<Result<Service[]>> {
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

      return {
        ok: true,
        value: services,
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
