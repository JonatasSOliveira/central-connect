import { FinalizeSelfSignup } from "@/application/use-cases/self-signup/FinalizeSelfSignup";
import { GetSelfSignupChurchContext } from "@/application/use-cases/self-signup/GetSelfSignupChurchContext";
import { LookupMemberByPhone } from "@/application/use-cases/self-signup/LookupMemberByPhone";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { ILegalConsentRepository } from "@/domain/ports/ILegalConsentRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { IRoleRepository } from "@/domain/ports/IRoleRepository";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { ChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/ChurchFirebaseRepository";
import { LegalConsentFirebaseRepository } from "@/infra/firebase-admin/repositories/LegalConsentFirebaseRepository";
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/infra/firebase-admin/repositories/RolePermissionFirebaseRepository";
import { RoleFirebaseRepository } from "@/infra/firebase-admin/repositories/RoleFirebaseRepository";
import { UserFirebaseRepository } from "@/infra/firebase-admin/repositories/UserFirebaseRepository";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";

class SelfSignupContainer {
  private static _churchRepository: IChurchRepository | null = null;
  private static _roleRepository: IRoleRepository | null = null;
  private static _rolePermissionRepository: IRolePermissionRepository | null =
    null;
  private static _memberRepository: IMemberRepository | null = null;
  private static _legalConsentRepository: ILegalConsentRepository | null = null;
  private static _memberChurchRepository: IMemberChurchRepository | null = null;
  private static _userRepository: IUserRepository | null = null;
  private static _googleAuthService: IGoogleAuthService | null = null;

  private static _getSelfSignupChurchContext: GetSelfSignupChurchContext | null =
    null;
  private static _lookupMemberByPhone: LookupMemberByPhone | null = null;
  private static _finalizeSelfSignup: FinalizeSelfSignup | null = null;

  private constructor() {}

  static get churchRepository(): IChurchRepository {
    if (!SelfSignupContainer._churchRepository) {
      SelfSignupContainer._churchRepository = new ChurchFirebaseRepository();
    }
    return SelfSignupContainer._churchRepository;
  }

  static get roleRepository(): IRoleRepository {
    if (!SelfSignupContainer._roleRepository) {
      SelfSignupContainer._roleRepository = new RoleFirebaseRepository();
    }
    return SelfSignupContainer._roleRepository;
  }

  static get memberRepository(): IMemberRepository {
    if (!SelfSignupContainer._memberRepository) {
      SelfSignupContainer._memberRepository = new MemberFirebaseRepository();
    }
    return SelfSignupContainer._memberRepository;
  }

  static get rolePermissionRepository(): IRolePermissionRepository {
    if (!SelfSignupContainer._rolePermissionRepository) {
      SelfSignupContainer._rolePermissionRepository =
        new RolePermissionFirebaseRepository();
    }
    return SelfSignupContainer._rolePermissionRepository;
  }

  static get legalConsentRepository(): ILegalConsentRepository {
    if (!SelfSignupContainer._legalConsentRepository) {
      SelfSignupContainer._legalConsentRepository =
        new LegalConsentFirebaseRepository();
    }
    return SelfSignupContainer._legalConsentRepository;
  }

  static get memberChurchRepository(): IMemberChurchRepository {
    if (!SelfSignupContainer._memberChurchRepository) {
      SelfSignupContainer._memberChurchRepository =
        new MemberChurchFirebaseRepository();
    }
    return SelfSignupContainer._memberChurchRepository;
  }

  static get userRepository(): IUserRepository {
    if (!SelfSignupContainer._userRepository) {
      SelfSignupContainer._userRepository = new UserFirebaseRepository();
    }
    return SelfSignupContainer._userRepository;
  }

  static get googleAuthService(): IGoogleAuthService {
    if (!SelfSignupContainer._googleAuthService) {
      SelfSignupContainer._googleAuthService = new GoogleAuthFirebaseService();
    }
    return SelfSignupContainer._googleAuthService;
  }

  static get getSelfSignupChurchContext(): GetSelfSignupChurchContext {
    if (!SelfSignupContainer._getSelfSignupChurchContext) {
      SelfSignupContainer._getSelfSignupChurchContext =
        new GetSelfSignupChurchContext(
          SelfSignupContainer.churchRepository,
          SelfSignupContainer.roleRepository,
          SelfSignupContainer.rolePermissionRepository,
        );
    }
    return SelfSignupContainer._getSelfSignupChurchContext;
  }

  static get lookupMemberByPhone(): LookupMemberByPhone {
    if (!SelfSignupContainer._lookupMemberByPhone) {
      SelfSignupContainer._lookupMemberByPhone = new LookupMemberByPhone(
        SelfSignupContainer.churchRepository,
        SelfSignupContainer.memberRepository,
      );
    }
    return SelfSignupContainer._lookupMemberByPhone;
  }

  static get finalizeSelfSignup(): FinalizeSelfSignup {
    if (!SelfSignupContainer._finalizeSelfSignup) {
      SelfSignupContainer._finalizeSelfSignup = new FinalizeSelfSignup(
        SelfSignupContainer.churchRepository,
        SelfSignupContainer.roleRepository,
        SelfSignupContainer.rolePermissionRepository,
        SelfSignupContainer.memberRepository,
        SelfSignupContainer.memberChurchRepository,
        SelfSignupContainer.userRepository,
        SelfSignupContainer.legalConsentRepository,
        SelfSignupContainer.googleAuthService,
      );
    }
    return SelfSignupContainer._finalizeSelfSignup;
  }
}

export const selfSignupContainer = SelfSignupContainer;
