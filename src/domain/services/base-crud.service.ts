import { BaseCrudPortIn } from '@/domain/ports/in/base-crud.port-in'
import { SessionServicePortInbound } from '../ports/inbound/session'
import { BaseRepository } from '../ports/out/base-repository'
import { BaseModel } from '../models/base.model'
import { Where } from '../types/repositories/where'
import { SafeParseReturnType } from 'zod'

export abstract class BaseCrudService<
  Model extends BaseModel,
  Repository extends BaseRepository<Model>,
  CreateDTO extends Partial<Model>,
  UpdateDTO extends Partial<Model>,
  ListDTO extends Model,
> implements BaseCrudPortIn<CreateDTO, UpdateDTO, ListDTO>
{
  constructor(
    protected readonly repository: Repository,
    protected readonly sessionService: SessionServicePortInbound,
  ) {}

  protected async getSessionUserId(): Promise<string> {
    const session = await this.sessionService.get()
    return session.id
  }

  protected abstract safeParse(
    data: Partial<Model>,
  ): SafeParseReturnType<CreateDTO, CreateDTO>

  protected async processData(
    data: CreateDTO | UpdateDTO,
  ): Promise<Partial<Model>> {
    return data
  }

  protected async getDefaultWhere(): Promise<Where<Model> | undefined> {
    return undefined
  }

  public async create(data: CreateDTO): Promise<string> {
    const result = this.safeParse(await this.processData(data))
    if (!result.success) {
      throw new Error('Validation failed')
    }

    return this.repository.create(
      {
        ...result.data,
      },
      await this.getSessionUserId(),
    )
  }

  public async update(id: string, data: UpdateDTO): Promise<void> {
    const result = this.safeParse(await this.processData(data))
    if (!result.success) {
      throw new Error('Validation failed')
    }

    await this.repository.update(
      id,
      await this.processData(data),
      await this.getSessionUserId(),
    )
  }

  public async listAll(): Promise<ListDTO[]> {
    return (await this.repository.list({
      where: await this.getDefaultWhere(),
    })) as ListDTO[]
  }

  public async delete(id: string): Promise<void> {
    await this.repository.logicalDelete(id, await this.getSessionUserId())
  }

  public async listOneById(id: string): Promise<ListDTO> {
    const dataList = await this.repository.list({
      where: { id } as Where<Model>,
    })
    return dataList[0] as ListDTO
  }
}
