import { validateSession } from "@/app/api/_lib/auth";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import { CreateChurch } from "@/modules/churches/application/use-cases/CreateChurch";
import { DeleteChurch } from "@/modules/churches/application/use-cases/DeleteChurch";
import { GetChurch } from "@/modules/churches/application/use-cases/GetChurch";
import { ListChurches } from "@/modules/churches/application/use-cases/ListChurches";
import { UpdateChurch } from "@/modules/churches/application/use-cases/UpdateChurch";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { createChurchHandler } from "@/modules/churches/presentation/http/handlers/church-handler";
import { createChurchesHandler } from "@/modules/churches/presentation/http/handlers/churches-handler";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";

export function createChurchesComposition() {
  const database = getDatabaseClient();
  const churchRepository = new ChurchDrizzleRepository(database);
  const roleRepository = new RoleDrizzleRepository(database);
  const memberChurchRepository = new MemberChurchDrizzleRepository(database);
  const useCases = {
    createChurch: new CreateChurch(
      churchRepository,
      roleRepository,
      memberChurchRepository,
    ),
    getChurch: new GetChurch(churchRepository),
    listChurches: new ListChurches(churchRepository),
    updateChurch: new UpdateChurch(churchRepository, roleRepository),
    deleteChurch: new DeleteChurch(churchRepository),
  };
  return {
    useCases,
    httpHandlers: {
      churches: createChurchesHandler(useCases, validateSession),
      church: createChurchHandler(useCases, validateSession),
    },
  };
}

export type ChurchesComposition = ReturnType<typeof createChurchesComposition>;
