import { BaseCrudPortIn } from './base-crud.port-in'
import { ChurchRoleCreateDTO } from '@/domain/dtos/church-role/create'
import { ChurchRoleListDto } from '@/domain/dtos/church-role/list'

export type ChurchRolePortInt = BaseCrudPortIn<
  ChurchRoleCreateDTO,
  ChurchRoleCreateDTO,
  ChurchRoleListDto
>
