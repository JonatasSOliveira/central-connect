import { ChurchRolePortInt } from '@/domain/ports/in/church-role'
import {
  ChurchRoleModel,
  ChurchRoleModelSchema,
} from '@/domain/models/church-role'
import { ChurchRoleRepository } from '@/domain/ports/out/church-role-repository'
import { ChurchRoleCreateDTO } from '@/domain/dtos/church-role/create'
import { ChurchRoleListDto } from '@/domain/dtos/church-role/list'
import { SafeParseReturnType } from 'zod'
import { BaseCrudWithChurchService } from './base-crud-with-church.service'

export class ChurchRoleService
  extends BaseCrudWithChurchService<
    ChurchRoleModel,
    ChurchRoleRepository,
    ChurchRoleCreateDTO,
    ChurchRoleCreateDTO,
    ChurchRoleListDto
  >
  implements ChurchRolePortInt
{
  protected override safeParse(
    data: Partial<ChurchRoleModel>,
  ): SafeParseReturnType<ChurchRoleCreateDTO, ChurchRoleCreateDTO> {
    return ChurchRoleModelSchema.safeParse(data)
  }
}
