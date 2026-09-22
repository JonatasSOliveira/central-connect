import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import type { IChurchRepository } from "@/modules/churches/application/ports/IChurchRepository";
import { ChurchFirebaseRepository } from "@/modules/churches/infrastructure/persistence/firebase/ChurchFirebaseRepository";
import type { IGoogleAuthService } from "@/modules/identity/application/ports/IGoogleAuthService";
import type { ILegalConsentRepository } from "@/modules/identity/application/ports/ILegalConsentRepository";
import type { IUserRepository } from "@/modules/identity/application/ports/IUserRepository";
import { LegalConsentFirebaseRepository } from "@/modules/identity/infrastructure/persistence/firebase/LegalConsentFirebaseRepository";
import { UserFirebaseRepository } from "@/modules/identity/infrastructure/persistence/firebase/UserFirebaseRepository";
import type { IMemberChurchRepository } from "@/modules/members/application/ports/IMemberChurchRepository";
import type { IMemberMinistryRepository } from "@/modules/members/application/ports/IMemberMinistryRepository";
import type { IMemberRepository } from "@/modules/members/application/ports/IMemberRepository";
import { MemberChurchFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberFirebaseRepository";
import { MemberMinistryFirebaseRepository } from "@/modules/members/infrastructure/persistence/firebase/MemberMinistryFirebaseRepository";
import type { IMinistryRepository } from "@/modules/ministries/application/ports/IMinistryRepository";
import { MinistryFirebaseRepository } from "@/modules/ministries/infrastructure/persistence/firebase/MinistryFirebaseRepository";
import type { IRolePermissionRepository } from "@/modules/roles/application/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/modules/roles/application/ports/IRoleRepository";
import { RoleFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RoleFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/modules/roles/infrastructure/persistence/firebase/RolePermissionFirebaseRepository";
import { FinalizeSelfSignup } from "@/modules/self-signup/application/use-cases/FinalizeSelfSignup";
import { GetSelfSignupChurchContext } from "@/modules/self-signup/application/use-cases/GetSelfSignupChurchContext";
import { LookupMemberByPhone } from "@/modules/self-signup/application/use-cases/LookupMemberByPhone";
import { getSelfSignupMemberFormRepositories } from "./member-form-repositories";

export interface SelfSignupInfrastructure {
  getSelfSignupChurchContext: GetSelfSignupChurchContext;
  lookupMemberByPhone: LookupMemberByPhone;
  finalizeSelfSignup: FinalizeSelfSignup;
}

let infrastructure: SelfSignupInfrastructure | undefined;

export function createSelfSignupInfrastructure(): SelfSignupInfrastructure {
  if (infrastructure) return infrastructure;

  const churchRepository: IChurchRepository = new ChurchFirebaseRepository();
  const roleRepository: IRoleRepository = new RoleFirebaseRepository();
  const rolePermissionRepository: IRolePermissionRepository =
    new RolePermissionFirebaseRepository();
  const memberRepository: IMemberRepository = new MemberFirebaseRepository();
  const legalConsentRepository: ILegalConsentRepository =
    new LegalConsentFirebaseRepository();
  const memberChurchRepository: IMemberChurchRepository =
    new MemberChurchFirebaseRepository();
  const userRepository: IUserRepository = new UserFirebaseRepository();
  const memberMinistryRepository: IMemberMinistryRepository =
    new MemberMinistryFirebaseRepository();
  const ministryRepository: IMinistryRepository =
    new MinistryFirebaseRepository();
  const googleAuthService: IGoogleAuthService = new GoogleAuthFirebaseService();

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
    finalizeSelfSignup: new FinalizeSelfSignup(
      churchRepository,
      roleRepository,
      rolePermissionRepository,
      memberRepository,
      memberChurchRepository,
      memberMinistryRepository,
      ministryRepository,
      userRepository,
      legalConsentRepository,
      googleAuthService,
      getSelfSignupMemberFormRepositories(),
    ),
  };

  return infrastructure;
}
