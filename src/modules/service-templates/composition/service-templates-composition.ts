import { validateSession } from "@/shared/presentation/http/auth";
import { CreateServiceTemplate } from "@/modules/service-templates/application/use-cases/CreateServiceTemplate";
import { DeleteServiceTemplate } from "@/modules/service-templates/application/use-cases/DeleteServiceTemplate";
import { GenerateWeekServices } from "@/modules/service-templates/application/use-cases/GenerateWeekServices";
import { GetServiceTemplate } from "@/modules/service-templates/application/use-cases/GetServiceTemplate";
import { ListServiceTemplates } from "@/modules/service-templates/application/use-cases/ListServiceTemplates";
import { UpdateServiceTemplate } from "@/modules/service-templates/application/use-cases/UpdateServiceTemplate";
import type { IServiceTemplateRepository } from "@/modules/service-templates/application/ports/IServiceTemplateRepository";
import type { IServiceRepository } from "@/modules/services/application/ports/IServiceRepository";
import { createGenerateWeekHandler } from "@/modules/service-templates/presentation/http/handlers/generate-week-handler";
import { createServiceTemplateHandler } from "@/modules/service-templates/presentation/http/handlers/service-template-handler";
import { createServiceTemplatesHandler } from "@/modules/service-templates/presentation/http/handlers/service-templates-handler";

export function createServiceTemplatesComposition(dependencies: {
  templateRepository: IServiceTemplateRepository;
  serviceRepository: IServiceRepository;
}) {
  const useCases = {
    listServiceTemplates: new ListServiceTemplates(
      dependencies.templateRepository,
    ),
    getServiceTemplate: new GetServiceTemplate(
      dependencies.templateRepository,
    ),
    createServiceTemplate: new CreateServiceTemplate(
      dependencies.templateRepository,
    ),
    updateServiceTemplate: new UpdateServiceTemplate(
      dependencies.templateRepository,
    ),
    deleteServiceTemplate: new DeleteServiceTemplate(
      dependencies.templateRepository,
    ),
    generateWeekServices: new GenerateWeekServices(
      dependencies.templateRepository,
      dependencies.serviceRepository,
    ),
  };
  return {
    useCases,
    httpHandlers: {
      serviceTemplates: createServiceTemplatesHandler(
        useCases,
        validateSession,
      ),
      serviceTemplate: createServiceTemplateHandler(useCases, validateSession),
      generateWeek: createGenerateWeekHandler(useCases, validateSession),
    },
  };
}

export type ServiceTemplatesComposition = ReturnType<
  typeof createServiceTemplatesComposition
>;
