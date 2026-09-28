import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { CreateMinistry } from "@/modules/ministries/application/use-cases/CreateMinistry";
import { DeleteMinistry } from "@/modules/ministries/application/use-cases/DeleteMinistry";
import { GetMinistry } from "@/modules/ministries/application/use-cases/GetMinistry";
import { ListMinistries } from "@/modules/ministries/application/use-cases/ListMinistries";
import { UpdateMinistry } from "@/modules/ministries/application/use-cases/UpdateMinistry";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import { MinistryRoleDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryRoleDrizzleRepository";
import { ScaleDrizzleRepository } from "@/modules/scales/infrastructure/persistence/drizzle/ScaleDrizzleRepository";
import { MinistriesHandler } from "../presentation/http/handlers/ministries-handler";
import { MinistryHandler } from "../presentation/http/handlers/ministry-handler";

/**
 * Transitional composition for ministries.
 *
 * The use cases and Firebase adapters still live in their legacy locations,
 * but they are now assembled here instead of through the global DI container.
 */
export function createMinistriesComposition() {
  const database = getDatabaseClient();
  const ministryRepository = new MinistryDrizzleRepository(database);
  const ministryRoleRepository = new MinistryRoleDrizzleRepository(database);
  const scaleRepository = new ScaleDrizzleRepository(database);
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
      scaleRepository,
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
