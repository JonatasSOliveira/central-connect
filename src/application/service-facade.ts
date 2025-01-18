import { FirebaseAuthAdapter } from '@/adapters/firebase/auth'
import { FirebaseChurchRepository } from '@/adapters/firebase/church-repository'
import { FirebaseUserRepository } from '@/adapters/firebase/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth'
import { ChurchPortIn } from '@/domain/ports/in/church'
import { AuthService } from '@/domain/services/auth'
import { ChurchService } from '@/domain/services/church'

export class ServiceFacade {
  private static readonly authService = new AuthService(
    new FirebaseAuthAdapter(),
    new FirebaseUserRepository(),
  )

  private static readonly churchService = new ChurchService(
    new FirebaseChurchRepository(),
  )

  public static getAuthService: () => AuthPortIn = () => this.authService

  public static getChurchService: () => ChurchPortIn = () => this.churchService
}
