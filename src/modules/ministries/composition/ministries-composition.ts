import { validateSession } from "@/app/api/_lib/auth";
import { CreateMinistry } from "@/modules/ministries/application/use-cases/CreateMinistry";
import { DeleteMinistry } from "@/modules/ministries/application/use-cases/DeleteMinistry";
import { GetMinistry } from "@/modules/ministries/application/use-cases/GetMinistry";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { UpdateMinistry } from "@/modules/ministries/application/use-cases/UpdateMinistry";
import { MinistryFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryFirebaseRepository";
import { MinistryRoleFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryRoleFirebaseRepository";
import { ScaleFirebaseRepository } from "@/modules/scales/infrastructure/persistence/firebase/ScaleFirebaseRepository";
import { MinistriesHandler } from "../presentation/http/handlers/ministries-handler";
import { MinistryHandler } from "../presentation/http/handlers/ministry-handler";

/**
 * Transitional composition for ministries.
 *
 * The use cases and Firebase adapters still live in their legacy locations,
 * but they are now assembled here instead of through the global DI container.
 */
export function createMinistriesComposition() {
  const ministryRepository = new MinistryFirebaseRepository();
  const ministryRoleRepository = new MinistryRoleFirebaseRepository();
  const useCases = {
    createMinistry: new CreateMinistry(
      ministryRepository,
      ministryRoleRepository,
    ),
    deleteMinistry: new DeleteMinistry(
      ministryRepository,
      ministryRoleRepository,
    ),
    getMinistry: new GetMinistry(ministryRepository, ministryRoleRepository),
    listMinistries: new ListMinistries(
      ministryRepository,
      ministryRoleRepository,
      new ScaleFirebaseRepository(),
    ),
    updateMinistry: new UpdateMinistry(
      ministryRepository,
      ministryRoleRepository,
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
