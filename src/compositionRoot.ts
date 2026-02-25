import { FirebaseAuthServiceAdapter } from "@/infra/firebase/adapters/AuthService.adapter";
import { FirebaseUserRepositoryAdapter } from "@/infra/firebase/adapters/UserRepository.adapter";
import { ISignInUseCase } from "./domain/ports/auth/ISignInUseCase.port";
import { SignInUseCase } from "./application/usecases/SignIn.usecase";

class CompositionRoot {
  private _authService?: FirebaseAuthServiceAdapter;
  private _userRepository?: FirebaseUserRepositoryAdapter;
  private _signInUseCase?: ISignInUseCase;

  private get authService() {
    if (!this._authService)
      this._authService = new FirebaseAuthServiceAdapter();
    return this._authService;
  }

  private get userRepository() {
    if (!this._userRepository)
      this._userRepository = new FirebaseUserRepositoryAdapter();
    return this._userRepository;
  }

  get signInUseCase() {
    if (!this._signInUseCase)
      this._signInUseCase = new SignInUseCase(
        this.authService,
        this.userRepository,
      );
    return this._signInUseCase;
  }
}

export const compositionRoot = new CompositionRoot();
