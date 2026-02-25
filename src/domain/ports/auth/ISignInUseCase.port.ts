import { SignInInputDTO } from "@/application/dtos/auth/SignIn.input.dto";
import { User } from "@/domain/entities/User/User";
import { UseCase } from "@/shared/interfaces/UseCase.interface";

export type ISignInUseCase = UseCase<SignInInputDTO, User, Error>;
