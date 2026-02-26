import { SignInWithGoogleInputDTO } from "@/application/dtos/auth/SignInWithGoogle.input.dto";
import { SignInWithGoogleOutputDTO } from "@/application/dtos/auth/SignInWithGoogle.output.dto";
import { UseCase } from "@/shared/interfaces/UseCase.interface";

export type ISignInWithGoogleUseCase = UseCase<
  SignInWithGoogleInputDTO,
  SignInWithGoogleOutputDTO
>;
