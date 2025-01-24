import { ServerDataStoragePortOut } from '@/domain/ports/out/server-data-storage'
import { SessionDTO, SessionServicePortInbound } from '../ports/inbound/session'
import { AuthenticatedUserDTO } from '../dtos/auth/authenticated_user'
import { JWTPayload, jwtVerify, SignJWT } from 'jose'

const oneDay = 1000 * 60 * 60 * 24
const jwtSecretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

export class SessionService implements SessionServicePortInbound {
  private readonly storageKey = 'session'

  constructor(private readonly dataStore: ServerDataStoragePortOut) {}

  private async encrypt(payload: { [key: string]: unknown }) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(jwtSecretKey)
  }

  private async decrypt(input: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(input, jwtSecretKey, {
        algorithms: ['HS256'],
      })
      return payload
    } catch {
      return null
    }
  }

  public async get(): Promise<SessionDTO> {
    const encryptedSession = await this.dataStore.get<string>(this.storageKey)
    if (!encryptedSession) throw new Error('User not authenticated')

    const decryptedData = await this.decrypt(encryptedSession)
    if (!decryptedData) throw new Error('User not authenticated')

    const sessionData: SessionDTO = {
      ...decryptedData,
    } as unknown as SessionDTO
    sessionData.expires = new Date(sessionData.expires)
    return sessionData
  }

  public async set(user: AuthenticatedUserDTO): Promise<void> {
    const expiresIn = new Date(Date.now() + oneDay)
    const encryptedSession = await this.encrypt({ ...user, expires: expiresIn })
    await this.dataStore.set<string>(
      this.storageKey,
      encryptedSession,
      expiresIn,
    )
  }

  public async logout(): Promise<void> {
    await this.dataStore.erase(this.storageKey)
  }
}
