export interface ServerDataStoragePortOut {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, expiresIn?: Date): Promise<void>
  erase(key: string): Promise<void>
}
