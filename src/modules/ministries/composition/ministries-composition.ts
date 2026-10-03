import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
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
  database: Parameters<typeof createTransactionalUseCase>[0];
  ministryRepository: IMinistryRepository;
  ministryRoleRepository: IMinistryRoleRepository;
  scaleRepository: IScaleRepository;
  createTransactionalRepositories: (
    database: DatabaseExecutor,
  ) => [IMinistryRepository, IMinistryRoleRepository];
}) {
  const createMinistry = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      new CreateMinistry(
        ...dependencies.createTransactionalRepositories(transaction),
      ),
  );
  const updateMinistry = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      new UpdateMinistry(
        ...dependencies.createTransactionalRepositories(transaction),
      ),
  );
  const deleteMinistry = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      new DeleteMinistry(
        ...dependencies.createTransactionalRepositories(transaction),
      ),
  );

  const useCases = {
    createMinistry,
    deleteMinistry,
    getMinistry: new GetMinistry(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
    ),
    listMinistries: new ListMinistries(
      dependencies.ministryRepository,
      dependencies.ministryRoleRepository,
      dependencies.scaleRepository,
    ),
    updateMinistry,
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
