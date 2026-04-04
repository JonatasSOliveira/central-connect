import {
  ServiceTemplate,
  type ServiceTemplateParams,
} from "@/domain/entities/ServiceTemplate";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import type {
  CreateServiceTemplateInput,
  CreateServiceTemplateOutput,
} from "../../dtos/serviceTemplate/CreateServiceTemplateDTO";
import { BaseUseCase } from "../BaseUseCase";

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
        shift: input.shift,
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
          shift: createdTemplate.shift,
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
