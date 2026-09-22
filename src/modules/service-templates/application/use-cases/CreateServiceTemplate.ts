import type { IServiceTemplateRepository } from "@/modules/service-templates/application/ports/IServiceTemplateRepository";
import {
  ServiceTemplate,
  type ServiceTemplateParams,
} from "@/modules/service-templates/domain/entities/ServiceTemplate";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";
import type {
  CreateServiceTemplateInput,
  CreateServiceTemplateOutput,
} from "../dtos/serviceTemplate/CreateServiceTemplateDTO";

export class CreateServiceTemplate extends BaseUseCase<
  CreateServiceTemplateInput & { churchId: string },
  CreateServiceTemplateOutput
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(
    input: CreateServiceTemplateInput & { churchId: string },
  ): Promise<Result<CreateServiceTemplateOutput>> {
    try {
      const templateParams: ServiceTemplateParams = {
        churchId: input.churchId,
        title: input.title,
        dayOfWeek: input.dayOfWeek,
        time: input.time,
        location: input.location ?? null,
        isActive: input.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const template = new ServiceTemplate(templateParams);
      const createdTemplate =
        await this.serviceTemplateRepository.create(template);

      return {
        ok: true,
        value: {
          id: createdTemplate.id,
          churchId: createdTemplate.churchId,
          title: createdTemplate.title,
          dayOfWeek: createdTemplate.dayOfWeek,
          time: createdTemplate.time,
          location: createdTemplate.location,
          isActive: createdTemplate.isActive,
          createdAt: createdTemplate.createdAt,
          updatedAt: createdTemplate.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "CREATE_SERVICE_TEMPLATE_FAILED",
          message: "Falha ao criar modelo de culto",
        },
      };
    }
  }
}
