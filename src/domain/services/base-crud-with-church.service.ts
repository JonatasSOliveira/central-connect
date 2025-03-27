import { BaseModel } from '@/domain/models/base.model'
import { BaseCrudPortIn } from '@/domain/ports/in/base-crud.port-in'
import { BaseRepository } from '@/domain/ports/out/base-repository'
import { BaseCrudService } from './base-crud.service'
import { SessionServicePortInbound } from '../ports/inbound/session'
import { ChurchStoragePortInbound } from '../ports/inbound/church-storage'
import { Where } from '../types/repositories/where'

interface BaseModelWithChurchId extends BaseModel {
  churchId: string
}

export abstract class BaseCrudWithChurchService<
    Model extends BaseModelWithChurchId,
    Repository extends BaseRepository<Model>,
    CreateDTO extends Partial<Model>,
    UpdateDTO extends Partial<Model>,
    ListDTO extends Model,
  >
  extends BaseCrudService<Model, Repository, CreateDTO, UpdateDTO, ListDTO>
  implements BaseCrudPortIn<CreateDTO, UpdateDTO, ListDTO>
{
  constructor(
    protected readonly repository: Repository,
    protected readonly sessionService: SessionServicePortInbound,
    protected readonly selectChurchStorage: ChurchStoragePortInbound,
  ) {
    super(repository, sessionService)
  }

  protected override async getDefaultWhere(): Promise<
    Where<Model> | undefined
  > {
    const selectedChurch = await this.selectChurchStorage.get()
    return { churchId: selectedChurch.id } as Where<Model>
  }

  protected override async processData(
    data: CreateDTO,
  ): Promise<Partial<Model>> {
    const selectedChurch = await this.selectChurchStorage.get()
    return { ...data, churchId: selectedChurch.id }
  }
}
