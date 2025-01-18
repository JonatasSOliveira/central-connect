'use server'

import { cookies } from 'next/headers'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { AuthenticatedUserDTO } from '@/domain/dtos/auth/authenticated_user'

interface Session extends AuthenticatedUserDTO {
  expires: Date
}

const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY)

async function encrypt(payload: { [key: string]: unknown }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(key)
}

async function decrypt(input: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function setSession(user: AuthenticatedUserDTO): Promise<void> {
  const oneDay = 1000 * 60 * 60 * 24
  const expires = new Date(Date.now() + oneDay)
  const encryptedSession = await encrypt({ ...user, expires })
  const cookiesRes = await cookies()
  cookiesRes.set('session', encryptedSession, { expires, httpOnly: true })
}

export async function logout(): Promise<void> {
  const cookiesRes = await cookies()
  cookiesRes.set('session', '', { expires: new Date(0) })
}

export async function getSession(): Promise<Session> {
  const cookiesRes = await cookies()
  const sessionEncrypted = cookiesRes.get('session')?.value
  if (!sessionEncrypted) throw new Error('User not authenticated')

  const decryptedData = await decrypt(sessionEncrypted)
  if (!decryptedData) throw new Error('User not authenticated')

  const sessionData: Session = { ...decryptedData } as unknown as Session
  sessionData.expires = new Date(sessionData.expires)
  return sessionData
}
