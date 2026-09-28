import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { CreateService } from "@/modules/services/application/use-cases/CreateService";
import { DeleteService } from "@/modules/services/application/use-cases/DeleteService";
import { GetService } from "@/modules/services/application/use-cases/GetService";
import { ListServices } from "@/modules/services/application/use-cases/ListServices";
import { UpdateService } from "@/modules/services/application/use-cases/UpdateService";
import { ServiceDrizzleRepository } from "@/modules/services/infrastructure/persistence/drizzle/ServiceDrizzleRepository";
import { createServiceHandler } from "@/modules/services/presentation/http/handlers/service-handler";
import { createServicesHandler } from "@/modules/services/presentation/http/handlers/services-handler";

export function createServicesComposition() {
  const repository = new ServiceDrizzleRepository(getDatabaseClient());
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
