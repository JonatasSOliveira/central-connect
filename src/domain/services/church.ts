import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchCreateDTO, ChurchCreateDTOSchema } from '../dtos/church/create'
import { ChurchRepository } from '../ports/out/church-repository'
import { getSession } from '@/lib/auth'
import { ChurchListDto } from '../dtos/church/list'

export class ChurchService implements ChurchPortIn {
  constructor(private readonly repository: ChurchRepository) {}

  private async getSessionUserId(): Promise<string> {
    const session = await getSession()
    return session.id
  }

  public async create(data: ChurchCreateDTO): Promise<string> {
    const result = ChurchCreateDTOSchema.safeParse(data)
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

  public async listAll(): Promise<ChurchListDto[]> {
    return await this.repository.list()
  }

  public async delete(id: string): Promise<void> {
    await this.repository.logicalDelete(id, await this.getSessionUserId())
  }

  public async update(id: string, data: ChurchCreateDTO): Promise<void> {
    await this.repository.update(id, data, await this.getSessionUserId())
  }

  public async listOneById(id: string): Promise<ChurchListDto> {
    const dataList = await this.repository.list({ where: { id } })
    return dataList[0]
  }
}
