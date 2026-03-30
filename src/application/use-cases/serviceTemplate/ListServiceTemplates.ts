import type { ServiceTemplate } from "@/domain/entities/ServiceTemplate";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import type {
  ListServiceTemplatesOutput,
  ServiceTemplateListItem,
} from "../../dtos/serviceTemplate/ListServiceTemplatesDTO";
import { BaseUseCase } from "../BaseUseCase";

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
          shift: template.shift,
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
