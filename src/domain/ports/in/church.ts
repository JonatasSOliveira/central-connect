import { ChurchCreateDTO } from '@/domain/dtos/church/create'
import { ChurchListDto } from '@/domain/dtos/church/list'

export interface ChurchPortIn {
  create(data: ChurchCreateDTO): Promise<string>
  listAll(): Promise<ChurchListDto[]>
  delete(id: string): Promise<void>
}
