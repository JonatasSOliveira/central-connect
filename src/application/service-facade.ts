import { CookiesServerDataStorage } from '@/adapters/cookies/server-data-storage'
import { FirebaseAuthAdapter } from '@/adapters/firebase/auth'
import { FirebaseChurchRepository } from '@/adapters/firebase/church-repository'
import { FirebaseUserRepository } from '@/adapters/firebase/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth'
import { ChurchPortIn } from '@/domain/ports/in/church'
import { SessionServicePortInbound } from '@/domain/ports/inbound/session'
import { AuthService } from '@/domain/services/auth'
import { ChurchService } from '@/domain/services/church'
import { SessionService } from '@/domain/services/session'

export class ServiceFacade {
  private static readonly sessionService: SessionServicePortInbound =
    new SessionService(new CookiesServerDataStorage())

  private static readonly authService: AuthPortIn = new AuthService(
    new FirebaseAuthAdapter(),
    new FirebaseUserRepository(),
    ServiceFacade.sessionService,
  )

  private static readonly churchService: ChurchPortIn = new ChurchService(
    new FirebaseChurchRepository(),
    ServiceFacade.sessionService,
  )

  public static getAuthService: () => AuthPortIn = () => this.authService

  public static getChurchService: () => ChurchPortIn = () => this.churchService
}
