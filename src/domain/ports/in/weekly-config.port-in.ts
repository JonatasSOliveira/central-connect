import { WeeklyConfigFormDTO } from '@/domain/dtos/weekly-config/form'
import { BaseCrudPortIn } from './base-crud.port-in'
import { WeeklyConfigListDTO } from '@/domain/dtos/weekly-config/list'

export type WeeklyConfigPortIn = BaseCrudPortIn<
  WeeklyConfigFormDTO,
  WeeklyConfigFormDTO,
  WeeklyConfigListDTO
>
