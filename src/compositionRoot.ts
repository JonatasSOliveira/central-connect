import { FirebaseUserRepositoryAdapter } from "@/infra/firebase/adapters/UserRepository.adapter";
import { IUserRepository } from "./domain/ports/auth/IUserRepository.port";
import { IAuthService } from "./domain/ports/auth/IAuthService.port";
import { JwtAuthServiceAdapter } from "./infra/jwt/AuthService.adapter";
import { ISignInWithGoogleUseCase } from "./domain/ports/auth/ISignInWithGoogleUseCase.port";
import { IGoogleTokenVerifier } from "./domain/ports/auth/IGoogleTokenVerifier.port";
import { FirebaseGoogleTokenVerifier } from "./infra/firebase/adapters/GoogleTokenVerifier.adapter";
import { SignInWithGoogleUseCase } from "./application/usecases/SignInWithGoogle.usecase";

class CompositionRoot {
  private _userRepository?: IUserRepository;
  private _authService?: IAuthService;
  private _googleTokenVerifier?: IGoogleTokenVerifier;

  private _signInWithGoogleUseCase?: ISignInWithGoogleUseCase;

  private get userRepository() {
    if (!this._userRepository)
      this._userRepository = new FirebaseUserRepositoryAdapter();
    return this._userRepository;
  }

  private get authService() {
    if (!this._authService) this._authService = new JwtAuthServiceAdapter();
    return this._authService;
  }

  private get googleTokenVerifier() {
    if (!this._googleTokenVerifier)
      this._googleTokenVerifier = new FirebaseGoogleTokenVerifier();
    return this._googleTokenVerifier;
  }

  get signInWithGoogleUseCase() {
    if (!this._signInWithGoogleUseCase)
      this._signInWithGoogleUseCase = new SignInWithGoogleUseCase(
        this.googleTokenVerifier,
        this.userRepository,
        this.authService,
      );
    return this._signInWithGoogleUseCase;
  }
}

export const compositionRoot = new CompositionRoot();
