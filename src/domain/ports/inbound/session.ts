import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'

export interface SessionDTO extends AuthenticatedUserDTO {
  expires: Date
}

export interface SessionServicePortInbound {
  get(): Promise<SessionDTO>
  set(session: AuthenticatedUserDTO): Promise<void>
  logout(): Promise<void>
}
