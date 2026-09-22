import { validateSession } from "@/app/api/_lib/auth";
import { CreateChurch } from "@/modules/churches/application/use-cases/CreateChurch";
import { DeleteChurch } from "@/modules/churches/application/use-cases/DeleteChurch";
import { GetChurch } from "@/modules/churches/application/use-cases/GetChurch";
import { ListChurches } from "@/modules/churches/application/use-cases/ListChurches";
import { UpdateChurch } from "@/modules/churches/application/use-cases/UpdateChurch";
import { ChurchFirebaseRepository } from "@/modules/churches/infrastructure/persistence/firebase/ChurchFirebaseRepository";
import { createChurchHandler } from "@/modules/churches/presentation/http/handlers/church-handler";
import { createChurchesHandler } from "@/modules/churches/presentation/http/handlers/churches-handler";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { RoleFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RoleFirebaseRepository";

export function createChurchesComposition() {
  const churchRepository = new ChurchFirebaseRepository();
  const roleRepository = new RoleFirebaseRepository();
  const memberChurchRepository = new MemberChurchFirebaseRepository();
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
