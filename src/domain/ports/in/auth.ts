import { AuthDTO } from '@/domain/dtos/auth/auth'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'
import { SignUpRequestDTO } from '@/domain/dtos/auth/sign-up.request'

export interface AuthPortIn {
  signIn(authData: AuthDTO): Promise<AuthenticatedUserDTO>
  signUp(signUpData: SignUpRequestDTO): Promise<AuthenticatedUserDTO>
}
