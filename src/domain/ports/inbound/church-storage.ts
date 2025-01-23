import { ChurchStorageDTO } from '@/domain/dtos/church/storage'

export interface ChurchStoragePortInbound {
  get(): Promise<ChurchStorageDTO>
  set(session: ChurchStorageDTO): Promise<void>
  erase(): Promise<void>
}
