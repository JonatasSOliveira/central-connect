import { BaseCrudService } from './base-crud.service'
import { SafeParseReturnType } from 'zod'
import { SessionServicePortInbound } from '../ports/inbound/session'
import { UserRoleModel } from '../models/user-role.model'
import { UserRoleRepository } from '../ports/out/user-role-repository.port-out'
import {
  UserRoleFormDTO,
  UserRoleFormDTOSchema,
} from '../dtos/user-role/form.dto'
import { UserRoleListDTO } from '../dtos/user-role/list.dto'
import { UserRolePortIn } from '../ports/in/user-role.port-in'

export class UserRoleService
  extends BaseCrudService<
    UserRoleModel,
    UserRoleRepository,
    UserRoleFormDTO,
    UserRoleFormDTO,
    UserRoleListDTO
  >
  implements UserRolePortIn
{
  constructor(
    protected readonly repository: UserRoleRepository,
    protected readonly sessionService: SessionServicePortInbound,
  ) {
    super(repository, sessionService)
  }

  protected override safeParse(
    data: Partial<UserRoleModel>,
  ): SafeParseReturnType<UserRoleFormDTO, UserRoleFormDTO> {
    return UserRoleFormDTOSchema.safeParse(data)
  }
}
