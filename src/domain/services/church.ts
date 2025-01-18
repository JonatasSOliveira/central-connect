import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchCreateDTO, ChurchCreateDTOSchema } from '../dtos/church/create'
import { ChurchRepository } from '../ports/out/church-repository'
import { getSession } from '@/lib/auth'
import { ChurchListDto } from '../dtos/church/list'

export class ChurchService implements ChurchPortIn {
  constructor(private readonly repository: ChurchRepository) {}

  public async create(data: ChurchCreateDTO): Promise<string> {
    console.log(data)
    const result = ChurchCreateDTOSchema.safeParse(data)
    if (!result.success) {
      throw new Error('Validation failed')
    }

    const session = await getSession()
    return this.repository.create({
      ...result.data,
      createdByUserId: session.id,
    })
  }

  public async listAll(): Promise<ChurchListDto[]> {
    const response = await this.repository.list()
    return response
  }
}
