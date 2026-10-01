import { validateSession } from "@/shared/presentation/http/auth";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import { CreateMember } from "@/modules/members/application/use-cases/CreateMember";
import { DeleteMember } from "@/modules/members/application/use-cases/DeleteMember";
import { GetMember } from "@/modules/members/application/use-cases/GetMember";
import { ListMembers } from "@/modules/members/application/use-cases/ListMembers";
import { UpdateMember } from "@/modules/members/application/use-cases/UpdateMember";
import type { IMemberAvailabilityRepository } from "@/modules/members/application/ports/IMemberAvailabilityRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberMinistryRoleRepository } from "@/modules/members/application/ports/IMemberMinistryRoleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import { createMemberHandler } from "@/modules/members/presentation/http/handlers/member-handler";
import { createMembersHandler } from "@/modules/members/presentation/http/handlers/members-handler";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import type { IMinistryRoleRepository } from "@/modules/ministries/application/ports/IMinistryRoleRepository";

export function createMembersComposition(dependencies: {
  database: Parameters<typeof createTransactionalUseCase>[0];
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  memberMinistryRoleRepository: IMemberMinistryRoleRepository;
  memberAvailabilityRepository: IMemberAvailabilityRepository;
  createTransactionalRepositories: (
    database: DatabaseExecutor,
  ) => ConstructorParameters<typeof CreateMember>;
  churchRepository: IChurchRepository;
  roleRepository: IRoleRepository;
  ministryRoleRepository: IMinistryRoleRepository;
}) {
  const createMember = createTransactionalUseCase(
    dependencies.database,
    (transaction) => {
      const repositories =
        dependencies.createTransactionalRepositories(transaction);
      return new CreateMember(...repositories);
    },
  );
  const updateMember = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      new UpdateMember(
        ...dependencies.createTransactionalRepositories(transaction),
      ),
  );
  const useCases = {
    listMembers: new ListMembers(
      dependencies.memberRepository,
      dependencies.memberChurchRepository,
      dependencies.memberMinistryRepository,
    ),
    createMember,
    getMember: new GetMember(
      dependencies.memberRepository,
      dependencies.memberChurchRepository,
      dependencies.memberMinistryRepository,
      dependencies.memberMinistryRoleRepository,
      dependencies.memberAvailabilityRepository,
      dependencies.churchRepository,
      dependencies.roleRepository,
      dependencies.ministryRoleRepository,
    ),
    updateMember,
    deleteMember: new DeleteMember(
      dependencies.memberRepository,
      dependencies.memberChurchRepository,
    ),
  };
  return {
    useCases,
    httpHandlers: {
      members: createMembersHandler(useCases, validateSession),
      member: createMemberHandler(useCases, validateSession),
    },
  };
}

export type MembersComposition = ReturnType<typeof createMembersComposition>;
