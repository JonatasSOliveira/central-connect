import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export class DeleteService extends BaseUseCase<
  { serviceId: string; churchId: string },
  void
> {
  constructor(private readonly serviceRepository: IServiceRepository) {
    super();
  }

  async execute(input: {
    serviceId: string;
    churchId: string;
  }): Promise<Result<void>> {
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
            message: "Você não tem permissão para excluir este culto",
          },
        };
      }

      await this.serviceRepository.delete(input.serviceId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "DELETE_SERVICE_FAILED",
          message: "Falha ao excluir culto",
        },
      };
    }
  }
}
