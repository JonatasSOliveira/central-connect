import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import type { Result } from "@/shared/types/Result";
import { BaseUseCase } from "../BaseUseCase";

export class DeleteServiceTemplate extends BaseUseCase<
  { templateId: string; churchId: string },
  void
> {
  constructor(
    private readonly serviceTemplateRepository: IServiceTemplateRepository,
  ) {
    super();
  }

  async execute(input: {
    templateId: string;
    churchId: string;
  }): Promise<Result<void>> {
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
            message: "Você não tem permissão para excluir este modelo",
          },
        };
      }

      await this.serviceTemplateRepository.delete(input.templateId);

      return {
        ok: true,
        value: undefined,
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "DELETE_SERVICE_TEMPLATE_FAILED",
          message: "Falha ao excluir modelo de culto",
        },
      };
    }
  }
}
