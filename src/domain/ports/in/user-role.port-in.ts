import { BaseCrudPortIn } from './base-crud.port-in'
import { UserRoleFormDTO } from '@/domain/dtos/user-role/form.dto'
import { UserRoleListDTO } from '@/domain/dtos/user-role/list.dto'

export type UserRolePortIn = BaseCrudPortIn<
  UserRoleFormDTO,
  UserRoleFormDTO,
  UserRoleListDTO
>
