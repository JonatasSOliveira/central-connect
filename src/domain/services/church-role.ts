import { ChurchRolePortInt } from '@/domain/ports/in/church-role'
import { BaseCrudService } from './base-crud'
import { ChurchRoleModel } from '@/domain/models/church-role'
import { ChurchRoleRepository } from '@/domain/ports/out/church-role-repository'
import {
  ChurchRoleCreateDTO,
  ChurchRoleCreateDTOSchema,
} from '@/domain/dtos/church-role/create'
import { ChurchRoleListDto } from '@/domain/dtos/church-role/list'
import { SafeParseReturnType } from 'zod'
import { ChurchStoragePortInbound } from '../ports/inbound/church-storage'
import { SessionServicePortInbound } from '../ports/inbound/session'

export class ChurchRoleService
  extends BaseCrudService<
    ChurchRoleModel,
    ChurchRoleRepository,
    ChurchRoleCreateDTO,
    ChurchRoleCreateDTO,
    ChurchRoleListDto
  >
  implements ChurchRolePortInt
{
  constructor(
    protected readonly repository: ChurchRoleRepository,
    protected readonly sessionService: SessionServicePortInbound,
    private readonly selectChurchStorage: ChurchStoragePortInbound,
  ) {
    super(repository, sessionService)
  }

  protected override safeParse(
    data: Partial<ChurchRoleModel>,
  ): SafeParseReturnType<ChurchRoleCreateDTO, ChurchRoleCreateDTO> {
    return ChurchRoleCreateDTOSchema.safeParse(data)
  }

  protected override async processData(
    data: ChurchRoleCreateDTO,
  ): Promise<Partial<ChurchRoleModel>> {
    const selectedChurch = await this.selectChurchStorage.get()
    return { ...data, churchId: selectedChurch.id }
  }
}
