import { PersonCreateDTO } from '@/domain/dtos/person/create'
import { BaseCrudPortIn } from './base-crud'
import { PersonListDTO } from '@/domain/dtos/person/list'

export type PersonPortIn = BaseCrudPortIn<
  PersonCreateDTO,
  PersonCreateDTO,
  PersonListDTO
>
