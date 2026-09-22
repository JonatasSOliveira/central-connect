import { validateSession } from "@/app/api/_lib/auth";
import { CreateServiceTemplate } from "@/modules/service-templates/application/use-cases/CreateServiceTemplate";
import { DeleteServiceTemplate } from "@/modules/service-templates/application/use-cases/DeleteServiceTemplate";
import { GenerateWeekServices } from "@/modules/service-templates/application/use-cases/GenerateWeekServices";
import { GetServiceTemplate } from "@/modules/service-templates/application/use-cases/GetServiceTemplate";
import { ListServiceTemplates } from "@/modules/service-templates/application/use-cases/ListServiceTemplates";
import { UpdateServiceTemplate } from "@/modules/service-templates/application/use-cases/UpdateServiceTemplate";
import { ServiceTemplateFirebaseRepository } from "@/modules/service-templates/infrastructure/persistence/firebase/ServiceTemplateFirebaseRepository";
import { createGenerateWeekHandler } from "@/modules/service-templates/presentation/http/handlers/generate-week-handler";
import { createServiceTemplateHandler } from "@/modules/service-templates/presentation/http/handlers/service-template-handler";
import { createServiceTemplatesHandler } from "@/modules/service-templates/presentation/http/handlers/service-templates-handler";
import { ServiceFirebaseRepository } from "@/modules/services/infrastructure/persistence/firebase/ServiceFirebaseRepository";

export function createServiceTemplatesComposition() {
  const templateRepository = new ServiceTemplateFirebaseRepository();
  const serviceRepository = new ServiceFirebaseRepository();
  const useCases = {
    listServiceTemplates: new ListServiceTemplates(templateRepository),
    getServiceTemplate: new GetServiceTemplate(templateRepository),
    createServiceTemplate: new CreateServiceTemplate(templateRepository),
    updateServiceTemplate: new UpdateServiceTemplate(templateRepository),
    deleteServiceTemplate: new DeleteServiceTemplate(templateRepository),
    generateWeekServices: new GenerateWeekServices(
      templateRepository,
      serviceRepository,
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
