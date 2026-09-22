import type { IServiceTemplateRepository } from "@/modules/service-templates/application/ports/IServiceTemplateRepository";
import type { ServiceTemplate } from "@/modules/service-templates/domain/entities/ServiceTemplate";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  ListServiceTemplatesOutput,
  ServiceTemplateListItem,
} from "../dtos/serviceTemplate/ListServiceTemplatesDTO";

export class ListServiceTemplates extends BaseUseCase<
  { churchId: string },
  ListServiceTemplatesOutput
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(input: {
    churchId: string;
  }): Promise<Result<ListServiceTemplatesOutput>> {
    try {
      const templates = await this.serviceTemplateRepository.findByChurchId(
        input.churchId,
      );

      const templateDTOs: ServiceTemplateListItem[] = templates.map(
        (template: ServiceTemplate) => ({
          id: template.id,
          churchId: template.churchId,
          title: template.title,
          dayOfWeek: template.dayOfWeek,
          time: template.time,
          location: template.location,
          isActive: template.isActive,
        }),
      );

      return {
        ok: true,
        value: {
          templates: templateDTOs,
        },
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
