import { AuthLoginUseCase } from "@/application/use-cases/auth/AuthLoginUseCase";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { IRolePermissionRepository } from "@/domain/ports/IRolePermissionRepository";
import type { ITokenService } from "@/domain/ports/ITokenService";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { RolePermissionFirebaseRepository } from "@/infra/firebase-admin/repositories/RolePermissionFirebaseRepository";
import { UserFirebaseRepository } from "@/infra/firebase-admin/repositories/UserFirebaseRepository";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

class AuthContainer {
  private static _googleAuthService: IGoogleAuthService | null = null;
  private static _tokenService: ITokenService | null = null;
  private static _userRepository: IUserRepository | null = null;
  private static _memberRepository: IMemberRepository | null = null;
  private static _memberChurchRepository: IMemberChurchRepository | null = null;
  private static _rolePermissionRepository: IRolePermissionRepository | null =
    null;
  private static _authLoginUseCase: AuthLoginUseCase | null = null;

  private constructor() {}

  static get googleAuthService(): IGoogleAuthService {
    if (!AuthContainer._googleAuthService) {
      AuthContainer._googleAuthService = new GoogleAuthFirebaseService();
    }
    return AuthContainer._googleAuthService;
  }

  static get tokenService(): ITokenService {
    if (!AuthContainer._tokenService) {
      AuthContainer._tokenService = new JoseTokenJwtService();
    }
    return AuthContainer._tokenService;
  }

  static get userRepository(): IUserRepository {
    if (!AuthContainer._userRepository) {
      AuthContainer._userRepository = new UserFirebaseRepository();
    }
    return AuthContainer._userRepository;
  }

  static get memberRepository(): IMemberRepository {
    if (!AuthContainer._memberRepository) {
      AuthContainer._memberRepository = new MemberFirebaseRepository();
    }
    return AuthContainer._memberRepository;
  }

  static get memberChurchRepository(): IMemberChurchRepository {
    if (!AuthContainer._memberChurchRepository) {
      AuthContainer._memberChurchRepository =
        new MemberChurchFirebaseRepository();
    }
    return AuthContainer._memberChurchRepository;
  }

  static get rolePermissionRepository(): IRolePermissionRepository {
    if (!AuthContainer._rolePermissionRepository) {
      AuthContainer._rolePermissionRepository =
        new RolePermissionFirebaseRepository();
    }
    return AuthContainer._rolePermissionRepository;
  }

  static get authLoginUseCase(): AuthLoginUseCase {
    if (!AuthContainer._authLoginUseCase) {
      AuthContainer._authLoginUseCase = new AuthLoginUseCase(
        AuthContainer.googleAuthService,
        AuthContainer.tokenService,
        AuthContainer.userRepository,
        AuthContainer.memberRepository,
        AuthContainer.memberChurchRepository,
        AuthContainer.rolePermissionRepository,
      );
    }
    return AuthContainer._authLoginUseCase;
  }
}

export const authContainer = AuthContainer;
