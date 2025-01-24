import { CookiesServerDataStorage } from '@/adapters/cookies/server-data-storage'
import { FirebaseAuthAdapter } from '@/adapters/firebase/auth'
import { FirebaseChurchRepository } from '@/adapters/firebase/church-repository'
import { FirebaseChurchRoleRepository } from '@/adapters/firebase/church-role-repository'
import { FirebaseUserRepository } from '@/adapters/firebase/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth'
import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchRolePortInt } from '@/domain/ports/in/church-role'
import { ChurchStoragePortInbound } from '@/domain/ports/inbound/church-storage'
import { SessionServicePortInbound } from '@/domain/ports/inbound/session'
import { ServerDataStoragePortOut } from '@/domain/ports/out/server-data-storage'
import { AuthService } from '@/domain/services/auth.service'
import { ChurchService } from '@/domain/services/church.service'
import { ChurchRoleService } from '@/domain/services/church-role.service'
import { ChurchStorageService } from '@/domain/services/church-storage.service'
import { SessionService } from '@/domain/services/session.service'
import { PersonPortIn } from '@/domain/ports/in/person'
import { PersonService } from '@/domain/services/person.service'
import { FirebasePersonRepository } from '@/adapters/firebase/person-repository'

export class ServiceFacade {
  private static readonly dataStore: ServerDataStoragePortOut =
    new CookiesServerDataStorage()

  private static readonly sessionService: SessionServicePortInbound =
    new SessionService(ServiceFacade.dataStore)

  private static readonly selectChurchStorage: ChurchStoragePortInbound =
    new ChurchStorageService(ServiceFacade.dataStore)

  private static readonly authService: AuthPortIn = new AuthService(
    new FirebaseAuthAdapter(),
    new FirebaseUserRepository(),
    ServiceFacade.sessionService,
  )

  private static readonly churchService: ChurchPortIn = new ChurchService(
    new FirebaseChurchRepository(),
    ServiceFacade.sessionService,
    ServiceFacade.selectChurchStorage,
  )

  private static readonly churchRoleService: ChurchRolePortInt =
    new ChurchRoleService(
      new FirebaseChurchRoleRepository(),
      ServiceFacade.sessionService,
      ServiceFacade.selectChurchStorage,
    )

  private static readonly personService: PersonPortIn = new PersonService(
    new FirebasePersonRepository(),
    ServiceFacade.sessionService,
    ServiceFacade.selectChurchStorage,
  )

  public static getAuthService: () => AuthPortIn = () => this.authService

  public static getChurchService: () => ChurchPortIn = () => this.churchService

  public static getChurchRoleService: () => ChurchRolePortInt = () =>
    this.churchRoleService

  public static getPersonService: () => PersonPortIn = () => this.personService
}
