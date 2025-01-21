import { ChurchCreateDTO } from '@/domain/dtos/church/create'
import { ChurchListDto } from '@/domain/dtos/church/list'
import { BaseCrudPortIn } from './base-crud'

export type ChurchPortIn = BaseCrudPortIn<
  ChurchCreateDTO,
  ChurchCreateDTO,
  ChurchListDto
>
