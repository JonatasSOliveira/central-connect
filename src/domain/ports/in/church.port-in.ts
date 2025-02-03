import { ChurchCreateDTO } from '@/domain/dtos/church/create'
import { ChurchListDto } from '@/domain/dtos/church/list'
import { BaseCrudPortIn } from './base-crud.port-in'
import { ChurchStorageDTO } from '@/domain/dtos/church/storage'

export interface ChurchPortIn
  extends BaseCrudPortIn<ChurchCreateDTO, ChurchCreateDTO, ChurchListDto> {
  selectChurch(church: ChurchStorageDTO): Promise<void>
  getSelectedChurch(): Promise<ChurchStorageDTO | null>
}
