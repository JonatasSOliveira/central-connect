import { validateSession } from "@/app/api/_lib/auth";
import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { CreateMember } from "@/modules/members/application/use-cases/CreateMember";
import { DeleteMember } from "@/modules/members/application/use-cases/DeleteMember";
import { GetMember } from "@/modules/members/application/use-cases/GetMember";
import { ListMembers } from "@/modules/members/application/use-cases/ListMembers";
import { UpdateMember } from "@/modules/members/application/use-cases/UpdateMember";
import { MemberAvailabilityDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberAvailabilityDrizzleRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import { createMemberHandler } from "@/modules/members/presentation/http/handlers/member-handler";
import { createMembersHandler } from "@/modules/members/presentation/http/handlers/members-handler";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";

export function createMembersComposition() {
  const database = getDatabaseClient();
  const memberRepository = new MemberDrizzleRepository(database);
  const memberChurchRepository = new MemberChurchDrizzleRepository(database);
  const memberMinistryRepository = new MemberMinistryDrizzleRepository(
    database,
  );
  const memberAvailabilityRepository = new MemberAvailabilityDrizzleRepository(
    database,
  );
  const createMember = createTransactionalUseCase(database, (transaction) => {
    const repositories = createMemberRepositories(transaction);
    return new CreateMember(...repositories);
  });
  const updateMember = createTransactionalUseCase(database, (transaction) => {
    const repositories = createMemberRepositories(transaction);
    return new UpdateMember(...repositories);
  });
  const useCases = {
    listMembers: new ListMembers(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
    ),
    createMember,
    getMember: new GetMember(
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      memberAvailabilityRepository,
      new ChurchDrizzleRepository(database),
      new RoleDrizzleRepository(database),
    ),
    updateMember,
    deleteMember: new DeleteMember(memberRepository, memberChurchRepository),
  };
  return {
    useCases,
    httpHandlers: {
      members: createMembersHandler(useCases, validateSession),
      member: createMemberHandler(useCases, validateSession),
    },
  };
}

function createMemberRepositories(database: DatabaseExecutor) {
  return [
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
    new MemberAvailabilityDrizzleRepository(database),
  ] as const;
}

export type MembersComposition = ReturnType<typeof createMembersComposition>;
