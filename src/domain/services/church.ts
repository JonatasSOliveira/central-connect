import { ChurchPortIn } from '@/domain/ports/in/church'
import { ChurchCreateDTO } from '../dtos/church/create'
import { ChurchRepository } from '../ports/out/church-repository'
import { ChurchListDto } from '../dtos/church/list'
import { BaseCrudService } from './base-crud'
import { ChurchModel, ChurchModelSchema } from '../models/church'
import { SafeParseReturnType } from 'zod'

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
  protected override safeParse(
    data: Partial<ChurchModel>,
  ): SafeParseReturnType<ChurchCreateDTO, ChurchCreateDTO> {
    return ChurchModelSchema.safeParse(data)
  }
}
