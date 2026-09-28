import { validateSession } from "@/shared/presentation/http/auth";
import { CreateMinistry } from "@/modules/ministries/application/use-cases/CreateMinistry";
import { DeleteMinistry } from "@/modules/ministries/application/use-cases/DeleteMinistry";
import { GetMinistry } from "@/modules/ministries/application/use-cases/GetMinistry";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { UpdateMinistry } from "@/modules/ministries/application/use-cases/UpdateMinistry";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";
import type { IScaleRepository } from "@/modules/scales/application/ports/IScaleRepository";
import { MinistriesHandler } from "../presentation/http/handlers/ministries-handler";
import { MinistryHandler } from "../presentation/http/handlers/ministry-handler";

export function createMinistriesComposition(dependencies: {
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  scaleRepository: IScaleRepository;
}) {
  const useCases = {
    createMinistry: new CreateMinistry(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
    deleteMinistry: new DeleteMinistry(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
    getMinistry: new GetMinistry(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
    listMinistries: new ListMinistries(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
      dependencies.scaleRepository,
    ),
    updateMinistry: new UpdateMinistry(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
  };

  return {
    useCases,
    httpHandlers: {
      collection: new MinistriesHandler(useCases, validateSession),
      resource: new MinistryHandler(useCases, validateSession),
    },
  };
}

export type MinistriesComposition = ReturnType<
  typeof createMinistriesComposition
>;
