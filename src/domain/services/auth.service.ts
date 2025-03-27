import { AuthDTO, AuthDTOSchema } from '@/domain/dtos/auth/auth'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'
import {
  SignUpRequestDTO,
  SignUpRequestDTOSchema,
} from '@/domain/dtos/auth/sign-up.request'
import { AuthPortOut } from '@/domain/ports/out/auth'
import { UserRepository } from '@/domain/ports/out/user-repository'
import { AuthPortIn } from '@/domain/ports/in/auth.port-in'
import { SessionServicePortInbound } from '../ports/inbound/session'

export class AuthService implements AuthPortIn {
  constructor(
    private readonly authPortOut: AuthPortOut,
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionServicePortInbound,
  ) {}

  public async signIn(request: AuthDTO): Promise<AuthenticatedUserDTO> {
    const result = AuthDTOSchema.safeParse(request)

    if (!result.success) {
      throw new Error('Validation failed')
    }

    const authenticatedUser = await this.authPortOut.signIn(result.data)
    await this.sessionService.set(authenticatedUser)
    return authenticatedUser
  }

  public async signUp(
    signUpData: SignUpRequestDTO,
  ): Promise<AuthenticatedUserDTO> {
    const result = SignUpRequestDTOSchema.safeParse(signUpData)

    if (!result.success) {
      throw new Error('Validation failed')
    }

    const resultData = result.data
    const authenticatedUser = await this.authPortOut.signUp(resultData)
    await this.userRepository.create({
      ...resultData,
      userId: authenticatedUser.id,
    })
    await this.sessionService.set(authenticatedUser)
    return authenticatedUser
  }
}
