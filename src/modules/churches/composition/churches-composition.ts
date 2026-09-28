import { validateSession } from "@/shared/presentation/http/auth";
import { CreateChurch } from "@/modules/churches/application/use-cases/CreateChurch";
import { DeleteChurch } from "@/modules/churches/application/use-cases/DeleteChurch";
import { GetChurch } from "@/modules/churches/application/use-cases/GetChurch";
import { ListChurches } from "@/modules/churches/application/use-cases/ListChurches";
import { UpdateChurch } from "@/modules/churches/application/use-cases/UpdateChurch";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { createChurchHandler } from "@/modules/churches/presentation/http/handlers/church-handler";
import { createChurchesHandler } from "@/modules/churches/presentation/http/handlers/churches-handler";

export function createChurchesComposition(dependencies: {
  churchRepository: IChurchRepository;
  memberChurchRepository: IMemberChurchRepository;
  roleRepository: IRoleRepository;
}) {
  const useCases = {
    createChurch: new CreateChurch(
      dependencies.churchRepository,
      dependencies.roleRepository,
      dependencies.memberChurchRepository,
    ),
    getChurch: new GetChurch(dependencies.churchRepository),
    listChurches: new ListChurches(dependencies.churchRepository),
    updateChurch: new UpdateChurch(
      dependencies.churchRepository,
      dependencies.roleRepository,
    ),
    deleteChurch: new DeleteChurch(dependencies.churchRepository),
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
