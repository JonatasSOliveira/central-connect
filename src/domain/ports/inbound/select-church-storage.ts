import { ChurchModel } from '@/domain/models/church'

export type ChurchStorageSelectDTO = Pick<ChurchModel, 'id' | 'name'>

export interface SelectChurchStoragePortInbound {
  get(): Promise<ChurchStorageSelectDTO>
  set(session: ChurchStorageSelectDTO): Promise<void>
  erase(): Promise<void>
}
