import { User } from "@/domain/entities/User/User";
import { ISignInUseCase } from "@/domain/ports/auth/ISignInUseCase.port";
import { Result } from "@/shared/result/Result";
import {
  SignInInputDTO,
  SignInInputSchema,
} from "../dtos/auth/SignIn.input.dto";
import { AuthService } from "@/domain/ports/auth/AuthService.port";
import { UserRepository } from "@/domain/ports/auth/UserRepository.port";

export class SignInUseCase implements ISignInUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  public execute(input: SignInInputDTO): Promise<Result<User, Error>> {
    return Result.wrapAsync(async () => {
      const userId = await this.authService.authenticate(
        input.email,
        input.password,
      );
      const user = new User({
        id: userId,
        email: input.email,
        displayName: input.email,
      });
      await this.userRepository.save(user);
      return user;
    });
  }
}
