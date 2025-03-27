import { BaseCrudService } from './base-crud.service'
import { SafeParseReturnType } from 'zod'
import { SessionServicePortInbound } from '../ports/inbound/session'
import { UserModel } from '../models/user.model'
import { UserRepository } from '../ports/out/user-repository'
import { UserFormDTO, UserFormDTOSchema } from '../dtos/users/form.dto'
import { UserListDTO } from '../dtos/users/list.dto'
import { UserPortIn } from '../ports/in/user.port-in'

export class UserService
  extends BaseCrudService<
    UserModel,
    UserRepository,
    UserFormDTO,
    UserFormDTO,
    UserListDTO
  >
  implements UserPortIn
{
  constructor(
    protected readonly repository: UserRepository,
    protected readonly sessionService: SessionServicePortInbound,
  ) {
    super(repository, sessionService)
  }

  protected override safeParse(
    data: Partial<UserModel>,
  ): SafeParseReturnType<UserFormDTO, UserFormDTO> {
    return UserFormDTOSchema.safeParse(data)
  }
}
