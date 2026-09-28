import { createTransactionalUseCase } from "@/infra/database/create-transactional-use-case";
import type { DatabaseClient } from "@/infra/database/contracts/database-client";
import type { DatabaseExecutor } from "@/infra/database/contracts/database-executor";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/modules/identity/application/ports/IGoogleAuthService";
import type { ILegalConsentRepository } from "@/modules/identity/application/ports/ILegalConsentRepository";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { FinalizeSelfSignup } from "@/modules/self-signup/application/use-cases/FinalizeSelfSignup";
import { GetSelfSignupChurchContext } from "@/modules/self-signup/application/use-cases/GetSelfSignupChurchContext";
import { LookupMemberByPhone } from "@/modules/self-signup/application/use-cases/LookupMemberByPhone";
import type { SaveSelfSignupMemberFormRepositories } from "@/modules/self-signup/application/use-cases/helpers/saveSelfSignupMemberForm";

export interface SelfSignupInfrastructure {
  getSelfSignupChurchContext: GetSelfSignupChurchContext;
  lookupMemberByPhone: LookupMemberByPhone;
  finalizeSelfSignup: Pick<FinalizeSelfSignup, "execute">;
}

export interface SelfSignupInfrastructureDependencies {
  database: DatabaseClient;
  churchRepository: IChurchRepository;
  roleRepository: IRoleRepository;
  rolePermissionRepository: IRolePermissionRepository;
  memberRepository: IMemberRepository;
  memberChurchRepository: IMemberChurchRepository;
  memberMinistryRepository: IMemberMinistryRepository;
  ministryRepository: IMinistryRepository;
  userRepository: IUserRepository;
  legalConsentRepository: ILegalConsentRepository;
  googleAuthService: IGoogleAuthService;
  createTransactionalRepositories: (
    database: DatabaseExecutor,
  ) => [
    IChurchRepository,
    IRoleRepository,
    IRolePermissionRepository,
    IMemberRepository,
    IMemberChurchRepository,
    IMemberMinistryRepository,
    IMinistryRepository,
    IUserRepository,
    ILegalConsentRepository,
  ];
  createMemberFormRepositories: (
    database: DatabaseExecutor,
  ) => SaveSelfSignupMemberFormRepositories;
}

export function createSelfSignupInfrastructure(
  dependencies: SelfSignupInfrastructureDependencies,
): SelfSignupInfrastructure {
  const finalizeSelfSignup = createTransactionalUseCase(
    dependencies.database,
    (transaction) =>
      new FinalizeSelfSignup(
        ...dependencies.createTransactionalRepositories(transaction),
        dependencies.googleAuthService,
        dependencies.createMemberFormRepositories(transaction),
      ),
  );

  return {
    getSelfSignupChurchContext: new GetSelfSignupChurchContext(
      dependencies.churchRepository,
      dependencies.roleRepository,
      dependencies.rolePermissionRepository,
      dependencies.ministryRepository,
    ),
    lookupMemberByPhone: new LookupMemberByPhone(
      dependencies.churchRepository,
      dependencies.memberRepository,
    ),
    finalizeSelfSignup,
  };

}
