import type { ServiceTemplate } from "@/domain/entities/ServiceTemplate";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export class ListServiceTemplates extends BaseUseCase<
  { churchId: string },
  ServiceTemplate[]
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(input: {
    churchId: string;
  }): Promise<Result<ServiceTemplate[]>> {
    try {
      const templates = await this.serviceTemplateRepository.findByChurchId(
        input.churchId,
      );

      return {
        ok: true,
        value: templates,
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "LIST_SERVICE_TEMPLATES_FAILED",
          message: "Falha ao listar modelos de culto",
        },
      };
    }
  }
}
