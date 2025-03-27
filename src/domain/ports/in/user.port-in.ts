import { UserFormDTO } from '@/domain/dtos/users/form.dto'
import { BaseCrudPortIn } from './base-crud.port-in'
import { UserListDTO } from '@/domain/dtos/users/list.dto'

export type UserPortIn = BaseCrudPortIn<UserFormDTO, UserFormDTO, UserListDTO>
