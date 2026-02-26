import { randomUUID } from "crypto";
import { User } from "@/domain/entities/User/User";
import { Result } from "@/shared/result/Result";
import { SignInWithGoogleInputDTO } from "../dtos/auth/SignInWithGoogle.input.dto";
import { IGoogleTokenVerifier } from "@/domain/ports/auth/IGoogleTokenVerifier.port";
import { IUserRepository } from "@/domain/ports/auth/IUserRepository.port";
import { IAuthService } from "@/domain/ports/auth/IAuthService.port";
import { ISignInWithGoogleUseCase } from "@/domain/ports/auth/ISignInWithGoogleUseCase.port";
import { SignInWithGoogleOutputDTO } from "../dtos/auth/SignInWithGoogle.output.dto";

export class SignInWithGoogleUseCase implements ISignInWithGoogleUseCase {
  constructor(
    private readonly googleTokenVerifier: IGoogleTokenVerifier,
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(
    input: SignInWithGoogleInputDTO,
  ): Promise<Result<SignInWithGoogleOutputDTO>> {
    try {
      const googleUser = await this.googleTokenVerifier.verify(input.token);

      let user = await this.userRepository.findByEmail(googleUser.email);

      if (!user) {
        user = new User({
          id: randomUUID(),
          email: googleUser.email,
          displayName: googleUser.name ?? "Usuário",
          provider: "google",
        });

        await this.userRepository.save(user);
      }

      const token = this.authService.createSession(user.id);

      return Result.ok({ token });
    } catch {
      return Result.err({
        status_code: 400,
        code: "INVALID_GOOGLE_TOKEN",
        message: "Token do Google inválido",
      });
    }
  }
}
