import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchCreateDTO, ChurchCreateDTOSchema } from '../dtos/church/create'
import { ChurchRepository } from '../ports/out/church-repository'
import { ChurchListDto } from '../dtos/church/list'
import { BaseCrudService } from './base-crud.service'
import { ChurchModel } from '../models/church'
import { SafeParseReturnType } from 'zod'
import { SessionServicePortInbound } from '../ports/inbound/session'
import { ChurchStoragePortInbound } from '../ports/inbound/church-storage'
import { ChurchStorageDTO } from '../dtos/church/storage'

export class ChurchService
  extends BaseCrudService<
    ChurchModel,
    ChurchRepository,
    ChurchCreateDTO,
    ChurchCreateDTO,
    ChurchListDto
  >
  implements ChurchPortIn
{
  constructor(
    protected readonly repository: ChurchRepository,
    protected readonly sessionService: SessionServicePortInbound,
    private readonly churchStorage: ChurchStoragePortInbound,
  ) {
    super(repository, sessionService)
  }

  protected override safeParse(
    data: Partial<ChurchModel>,
  ): SafeParseReturnType<ChurchCreateDTO, ChurchCreateDTO> {
    return ChurchCreateDTOSchema.safeParse(data)
  }

  public async selectChurch(church: ChurchStorageDTO): Promise<void> {
    await this.churchStorage.set(church)
  }

  public async getSelectedChurch(): Promise<ChurchStorageDTO | null> {
    try {
      return await this.churchStorage.get()
    } catch {
      return null
    }
  }
}
