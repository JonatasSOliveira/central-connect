import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import type { CreateServiceTemplateOutput } from "../../dtos/serviceTemplate/CreateServiceTemplateDTO";
import { BaseUseCase } from "../BaseUseCase";

export class GetServiceTemplate extends BaseUseCase<
  { templateId: string; churchId: string },
  CreateServiceTemplateOutput
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(input: {
    templateId: string;
    churchId: string;
  }): Promise<Result<CreateServiceTemplateOutput>> {
    try {
      const template = await this.serviceTemplateRepository.findById(
        input.templateId,
      );

      if (!template) {
        return {
          ok: false,
          error: {
            code: "SERVICE_TEMPLATE_NOT_FOUND",
            message: "Modelo de culto não encontrado",
          },
        };
      }

      if (template.churchId !== input.churchId) {
        return {
          ok: false,
          error: {
            code: "NOT_AUTHORIZED",
            message: "Você não tem permissão para visualizar este modelo",
          },
        };
      }

      return {
        ok: true,
        value: {
          id: template.id,
          churchId: template.churchId,
          title: template.title,
          dayOfWeek: template.dayOfWeek,
          shift: template.shift,
          time: template.time,
          location: template.location,
          isActive: template.isActive,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "GET_SERVICE_TEMPLATE_FAILED",
          message: "Falha ao obter modelo de culto",
        },
      };
    }
  }
}
