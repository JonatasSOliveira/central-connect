import { ServerDataStoragePortOut } from '@/domain/ports/out/server-data-storage'
import { cookies } from 'next/headers'

export class CookiesServerDataStorage implements ServerDataStoragePortOut {
  public async set<T>(key: string, value: T, expiresIn?: Date): Promise<void> {
    const cookiesRes = await cookies()
    cookiesRes.set(key, JSON.stringify(value), {
      httpOnly: true,
      expires: expiresIn,
    })
  }

  public async get<T>(key: string): Promise<T | null> {
    const cookiesRes = await cookies()
    const value = cookiesRes.get(key)?.value
    if (!value) return null
    return JSON.parse(value)
  }

  public async erase(key: string): Promise<void> {
    const cookiesRes = await cookies()
    cookiesRes.delete(key)
  }
}
