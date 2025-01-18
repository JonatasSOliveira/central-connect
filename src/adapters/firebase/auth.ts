import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { AuthDTO } from '@/domain/dtos/auth/auth'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'
import { AuthPortOut } from '@/domain/ports/out/auth'
import { FirebaseProvider } from '@/infra/firebase/provider'

export class FirebaseAuthAdapter implements AuthPortOut {
  public async signIn({
    email,
    password,
  }: AuthDTO): Promise<AuthenticatedUserDTO> {
    try {
      const response = await signInWithEmailAndPassword(
        FirebaseProvider.getAuth(),
        email,
        password,
      )
      const authenticatedUser: AuthenticatedUserDTO = {
        id: response.user.uid,
        email: response.user.email as string,
      }
      return authenticatedUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  public async signUp({
    email,
    password,
  }: AuthDTO): Promise<AuthenticatedUserDTO> {
    try {
      const response = await createUserWithEmailAndPassword(
        FirebaseProvider.getAuth(),
        email,
        password,
      )
      const authenticatedUser: AuthenticatedUserDTO = {
        id: response.user.uid,
        email: response.user.email as string,
      }
      return authenticatedUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
