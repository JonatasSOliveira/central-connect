import { AuthLoginUseCase } from "@/application/use-cases/auth/AuthLoginUseCase";
import { CreateChurch } from "@/application/use-cases/church/CreateChurch";
import { GetChurch } from "@/application/use-cases/church/GetChurch";
import { ListChurches } from "@/application/use-cases/church/ListChurches";
import { UpdateChurch } from "@/application/use-cases/church/UpdateChurch";
import { CreateMemberWithChurch } from "@/application/use-cases/member/CreateMemberWithChurch";
import { LinkUserToMember } from "@/application/use-cases/member/LinkUserToMember";
import type { IChurchRepository } from "@/domain/ports/IChurchRepository";
import type { IGoogleAuthService } from "@/domain/ports/IGoogleAuthService";
import type { IInviteRepository } from "@/domain/ports/IInviteRepository";
import type { IMemberChurchRepository } from "@/domain/ports/IMemberChurchRepository";
import type { IMemberRepository } from "@/domain/ports/IMemberRepository";
import type { ITokenService } from "@/domain/ports/ITokenService";
import type { IUserRepository } from "@/domain/ports/IUserRepository";
import { ChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/ChurchFirebaseRepository";
import { InviteFirebaseRepository } from "@/infra/firebase-admin/repositories/InviteFirebaseRepository";
import { MemberChurchFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberChurchFirebaseRepository";
import { MemberFirebaseRepository } from "@/infra/firebase-admin/repositories/MemberFirebaseRepository";
import { UserFirebaseRepository } from "@/infra/firebase-admin/repositories/UserFirebaseRepository";
import { GoogleAuthFirebaseService } from "@/infra/firebase-admin/services/GoogleAuthFirebaseService";
import { JoseTokenJwtService } from "@/infra/jose/JoseTokenJwtService";

class Container {
  private static instance: Container;

  private _googleAuthService: IGoogleAuthService | null = null;
  private _tokenService: ITokenService | null = null;
  private _userRepository: IUserRepository | null = null;
  private _memberRepository: IMemberRepository | null = null;
  private _memberChurchRepository: IMemberChurchRepository | null = null;
  private _churchRepository: IChurchRepository | null = null;
  private _inviteRepository: IInviteRepository | null = null;
  private _authLoginUseCase: AuthLoginUseCase | null = null;
  private _createChurch: CreateChurch | null = null;
  private _getChurch: GetChurch | null = null;
  private _listChurches: ListChurches | null = null;
  private _updateChurch: UpdateChurch | null = null;
  private _createMemberWithChurch: CreateMemberWithChurch | null = null;
  private _linkUserToMember: LinkUserToMember | null = null;

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

  get memberChurchRepository(): IMemberChurchRepository {
    if (!this._memberChurchRepository) {
      this._memberChurchRepository = new MemberChurchFirebaseRepository();
    }
    return this._memberChurchRepository;
  }

  get churchRepository(): IChurchRepository {
    if (!this._churchRepository) {
      this._churchRepository = new ChurchFirebaseRepository();
    }
    return this._churchRepository;
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
        this.memberChurchRepository,
        this.inviteRepository,
      );
    }
    return this._authLoginUseCase;
  }

  get createChurch(): CreateChurch {
    if (!this._createChurch) {
      this._createChurch = new CreateChurch(this.churchRepository);
    }
    return this._createChurch;
  }

  get getChurch(): GetChurch {
    if (!this._getChurch) {
      this._getChurch = new GetChurch(this.churchRepository);
    }
    return this._getChurch;
  }

  get listChurches(): ListChurches {
    if (!this._listChurches) {
      this._listChurches = new ListChurches(this.churchRepository);
    }
    return this._listChurches;
  }

  get updateChurch(): UpdateChurch {
    if (!this._updateChurch) {
      this._updateChurch = new UpdateChurch(this.churchRepository);
    }
    return this._updateChurch;
  }

  get createMemberWithChurch(): CreateMemberWithChurch {
    if (!this._createMemberWithChurch) {
      this._createMemberWithChurch = new CreateMemberWithChurch(
        this.memberRepository,
        this.memberChurchRepository,
      );
    }
    return this._createMemberWithChurch;
  }

  get linkUserToMember(): LinkUserToMember {
    if (!this._linkUserToMember) {
      this._linkUserToMember = new LinkUserToMember(this.userRepository);
    }
    return this._linkUserToMember;
  }
}

export const container = Container.getInstance();
