import { FirebaseAuthAdapter } from '@/adapters/firebase/auth'
import { FirebaseUserRepository } from '@/adapters/firebase/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth'
import { AuthService } from '@/domain/services/auth'

export class ServiceFacade {
  private static authService = new AuthService(
    new FirebaseAuthAdapter(),
    new FirebaseUserRepository(),
  )

  public static getAuth(): AuthPortIn {
    return this.authService
  }
}
