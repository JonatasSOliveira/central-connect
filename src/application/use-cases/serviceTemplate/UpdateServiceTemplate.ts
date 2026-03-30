import {
  ServiceTemplate,
  type ServiceTemplateParams,
} from "@/domain/entities/ServiceTemplate";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import type { CreateServiceTemplateOutput } from "../../dtos/serviceTemplate/CreateServiceTemplateDTO";
import type { UpdateServiceTemplateInput } from "../../dtos/serviceTemplate/UpdateServiceTemplateDTO";
import { BaseUseCase } from "../BaseUseCase";

export class UpdateServiceTemplate extends BaseUseCase<
  UpdateServiceTemplateInput & { templateId: string; churchId: string },
  CreateServiceTemplateOutput
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(
    input: UpdateServiceTemplateInput & {
      templateId: string;
      churchId: string;
    },
  ): Promise<Result<CreateServiceTemplateOutput>> {
    try {
      const existingTemplate = await this.serviceTemplateRepository.findById(
        input.templateId,
      );

      if (!existingTemplate) {
        return {
          ok: false,
          error: {
            code: "SERVICE_TEMPLATE_NOT_FOUND",
            message: "Modelo de culto não encontrado",
          },
        };
      }

      if (existingTemplate.churchId !== input.churchId) {
        return {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Você não tem permissão para editar este modelo",
          },
        };
      }

      const templateParams: ServiceTemplateParams = {
        id: existingTemplate.id,
        churchId: existingTemplate.churchId,
        title: input.title ?? existingTemplate.title,
        dayOfWeek: input.dayOfWeek ?? existingTemplate.dayOfWeek,
        shift: input.shift ?? existingTemplate.shift,
        time: input.time ?? existingTemplate.time,
        location:
          input.location !== undefined
            ? (input.location ?? null)
            : existingTemplate.location,
        isActive: input.isActive ?? existingTemplate.isActive,
        createdAt: existingTemplate.createdAt,
        updatedAt: new Date(),
      };

      const template = new ServiceTemplate(templateParams);
      const updatedTemplate =
        await this.serviceTemplateRepository.update(template);

      return {
        ok: true,
        value: {
          id: updatedTemplate.id,
          churchId: updatedTemplate.churchId,
          title: updatedTemplate.title,
          dayOfWeek: updatedTemplate.dayOfWeek,
          shift: updatedTemplate.shift,
          time: updatedTemplate.time,
          location: updatedTemplate.location,
          isActive: updatedTemplate.isActive,
          createdAt: updatedTemplate.createdAt,
          updatedAt: updatedTemplate.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "UPDATE_SERVICE_TEMPLATE_FAILED",
          message: "Falha ao atualizar modelo de culto",
        },
      };
    }
  }
}
