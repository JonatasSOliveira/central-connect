import { AuthDTO } from '@/domain/dtos/auth/auth'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'

export interface AuthPortOut {
  signIn(authData: AuthDTO): Promise<AuthenticatedUserDTO>
  signUp(authData: AuthDTO): Promise<AuthenticatedUserDTO>
}
