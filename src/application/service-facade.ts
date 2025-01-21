import { CookiesServerDataStorage } from '@/adapters/cookies/server-data-storage'
import { FirebaseAuthAdapter } from '@/adapters/firebase/auth'
import { FirebaseChurchRepository } from '@/adapters/firebase/church-repository'
import { FirebaseChurchRoleRepository } from '@/adapters/firebase/church-role-repository'
import { FirebaseUserRepository } from '@/adapters/firebase/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth'
import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchRolePortInt } from '@/domain/ports/in/church-role'
import { SelectChurchStoragePortInbound } from '@/domain/ports/inbound/select-church-storage'
import { SessionServicePortInbound } from '@/domain/ports/inbound/session'
import { ServerDataStoragePortOut } from '@/domain/ports/out/server-data-storage'
import { AuthService } from '@/domain/services/auth'
import { ChurchService } from '@/domain/services/church'
import { ChurchRoleService } from '@/domain/services/church-role'
import { SelectChurchStorageService } from '@/domain/services/select-church-storage'
import { SessionService } from '@/domain/services/session'

export class ServiceFacade {
  private static readonly dataStore: ServerDataStoragePortOut =
    new CookiesServerDataStorage()

  private static readonly sessionService: SessionServicePortInbound =
    new SessionService(ServiceFacade.dataStore)

  private static readonly selectChurchStorage: SelectChurchStoragePortInbound =
    new SelectChurchStorageService(ServiceFacade.dataStore)

  private static readonly authService: AuthPortIn = new AuthService(
    new FirebaseAuthAdapter(),
    new FirebaseUserRepository(),
    ServiceFacade.sessionService,
  )

  private static readonly churchService: ChurchPortIn = new ChurchService(
    new FirebaseChurchRepository(),
    ServiceFacade.sessionService,
  )

  private static readonly churchRoleService: ChurchRolePortInt =
    new ChurchRoleService(
      new FirebaseChurchRoleRepository(),
      ServiceFacade.sessionService,
      ServiceFacade.selectChurchStorage,
    )

  public static getAuthService: () => AuthPortIn = () => this.authService

  public static getChurchService: () => ChurchPortIn = () => this.churchService

  public static getChurchRoleService: () => ChurchRolePortInt = () =>
    this.churchRoleService
}
