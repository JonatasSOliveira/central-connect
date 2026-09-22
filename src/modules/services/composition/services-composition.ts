import { validateSession } from "@/app/api/_lib/auth";
import { CreateService } from "@/modules/services/application/use-cases/CreateService";
import { DeleteService } from "@/modules/services/application/use-cases/DeleteService";
import { GetService } from "@/modules/services/application/use-cases/GetService";
import { ListServices } from "@/modules/services/application/use-cases/ListServices";
import { UpdateService } from "@/modules/services/application/use-cases/UpdateService";
import { ServiceFirebaseRepository } from "@/modules/services/infrastructure/persistence/firebase/ServiceFirebaseRepository";
import { createServiceHandler } from "@/modules/services/presentation/http/handlers/service-handler";
import { createServicesHandler } from "@/modules/services/presentation/http/handlers/services-handler";

export function createServicesComposition() {
  const repository = new ServiceFirebaseRepository();
  const useCases = {
    listServices: new ListServices(repository),
    createService: new CreateService(repository),
    getService: new GetService(repository),
    updateService: new UpdateService(repository),
    deleteService: new DeleteService(repository),
  };
  return {
    useCases,
    httpHandlers: {
      services: createServicesHandler(useCases, validateSession),
      service: createServiceHandler(useCases, validateSession),
    },
  };
}

export type ServicesComposition = ReturnType<typeof createServicesComposition>;
