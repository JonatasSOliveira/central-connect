import { AuthLoginUseCase } from "@/application/use-cases/auth/AuthLoginUseCase";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { ITokenService } from "@/domain/ports/ITokenService";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { InviteFirebaseRepository } from "@/infra/firebase/repositories/InviteFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase/repositories/MemberFirebaseRepository";
import { UserFirebaseRepository } from "@/infra/firebase/repositories/UserFirebaseRepository";
import { GoogleAuthFirebaseService } from "@/infra/firebase/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

class Container {
  private static instance: Container;

  private _googleAuthService: IGoogleAuthService | null = null;
  private _tokenService: ITokenService | null = null;
  private _userRepository: IUserRepository | null = null;
  private _memberRepository: IMemberRepository | null = null;
  private _inviteRepository: IInviteRepository | null = null;
  private _authLoginUseCase: AuthLoginUseCase | null = null;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get googleAuthService(): IGoogleAuthService {
    if (!this._googleAuthService) {
      this._googleAuthService = new GoogleAuthFirebaseService();
    }
    return this._googleAuthService;
  }

  get tokenService(): ITokenService {
    if (!this._tokenService) {
      this._tokenService = new JoseTokenJwtService();
    }
    return this._tokenService;
  }

  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserFirebaseRepository();
    }
    return this._userRepository;
  }

  get memberRepository(): IMemberRepository {
    if (!this._memberRepository) {
      this._memberRepository = new MemberFirebaseRepository();
    }
    return this._memberRepository;
  }

  get inviteRepository(): IInviteRepository {
    if (!this._inviteRepository) {
      this._inviteRepository = new InviteFirebaseRepository();
    }
    return this._inviteRepository;
  }

  get authLoginUseCase(): AuthLoginUseCase {
    if (!this._authLoginUseCase) {
      this._authLoginUseCase = new AuthLoginUseCase(
        this.googleAuthService,
        this.tokenService,
        this.userRepository,
        this.memberRepository,
        this.inviteRepository,
      );
    }
    return this._authLoginUseCase;
  }
}

export const container = Container.getInstance();
