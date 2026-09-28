import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import { getDatabaseClient } from "@/infra/database/get-database-client";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import { ChurchDrizzleRepository } from "@/modules/churches/infrastructure/persistence/drizzle/ChurchDrizzleRepository";
import { LegalConsentDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/LegalConsentDrizzleRepository";
import { UserDrizzleRepository } from "@/modules/identity/infrastructure/persistence/drizzle/UserDrizzleRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import { MemberChurchDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberChurchDrizzleRepository";
import { MemberDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberDrizzleRepository";
import { MemberMinistryDrizzleRepository } from "@/modules/members/infrastructure/persistence/drizzle/MemberMinistryDrizzleRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import { MinistryDrizzleRepository } from "@/modules/ministries/infrastructure/persistence/drizzle/MinistryDrizzleRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { RoleDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RoleDrizzleRepository";
import { RolePermissionDrizzleRepository } from "@/modules/roles/infrastructure/persistence/drizzle/RolePermissionDrizzleRepository";
import { FinalizeSelfSignup } from "@/modules/self-signup/application/use-cases/FinalizeSelfSignup";
import { GetSelfSignupChurchContext } from "@/modules/self-signup/application/use-cases/GetSelfSignupChurchContext";
import { LookupMemberByPhone } from "@/modules/self-signup/application/use-cases/LookupMemberByPhone";
import { getSelfSignupMemberFormRepositories } from "./member-form-repositories";

export interface SelfSignupInfrastructure {
  getSelfSignupChurchContext: GetSelfSignupChurchContext;
  lookupMemberByPhone: LookupMemberByPhone;
  finalizeSelfSignup: Pick<FinalizeSelfSignup, "execute">;
}

let infrastructure: SelfSignupInfrastructure | undefined;

export function createSelfSignupInfrastructure(): SelfSignupInfrastructure {
  if (infrastructure) return infrastructure;

  const database = getDatabaseClient();
  const churchRepository: IChurchRepository = new ChurchDrizzleRepository(
    database,
  );
  const roleRepository: IRoleRepository = new RoleDrizzleRepository(database);
  const rolePermissionRepository: IRolePermissionRepository =
    new RolePermissionDrizzleRepository(database);
  const memberRepository: IMemberRepository = new MemberDrizzleRepository(
    database,
  );
  const ministryRepository: IMinistryRepository = new MinistryDrizzleRepository(
    database,
  );
  const finalizeSelfSignup = createTransactionalUseCase(
    database,
    (transaction) => createFinalizeSelfSignup(transaction),
  );

  infrastructure = {
    getSelfSignupChurchContext: new GetSelfSignupChurchContext(
      churchRepository,
      roleRepository,
      rolePermissionRepository,
      ministryRepository,
    ),
    lookupMemberByPhone: new LookupMemberByPhone(
      churchRepository,
      memberRepository,
    ),
    finalizeSelfSignup,
  };

  return infrastructure;
}

function createFinalizeSelfSignup(database: DatabaseExecutor) {
  return new FinalizeSelfSignup(
    new ChurchDrizzleRepository(database),
    new RoleDrizzleRepository(database),
    new RolePermissionDrizzleRepository(database),
    new MemberDrizzleRepository(database),
    new MemberChurchDrizzleRepository(database),
    new MemberMinistryDrizzleRepository(database),
    new MinistryDrizzleRepository(database),
    new UserDrizzleRepository(database),
    new LegalConsentDrizzleRepository(database),
    new GoogleAuthFirebaseService(),
    getSelfSignupMemberFormRepositories(database),
  );
}
