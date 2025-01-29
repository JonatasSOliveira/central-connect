import { SafeParseReturnType } from 'zod'
import { WeeklyConfigFormDTO } from '../dtos/weekly-config/form'
import { WeeklyConfigListDTO } from '../dtos/weekly-config/list'
import {
  WeeklyConfigModel,
  WeeklyConfigModelSchema,
} from '../models/weekly-config'
import { WeeklyConfigPortIn } from '../ports/in/weekly-config'
import { WeeklyConfigRepository } from '../ports/out/weekly-config-repository'
import { BaseCrudWithChurchService } from './base-crud-with-church.service'

export class WeeklyConfigService
  extends BaseCrudWithChurchService<
    WeeklyConfigModel,
    WeeklyConfigRepository,
    WeeklyConfigFormDTO,
    WeeklyConfigFormDTO,
    WeeklyConfigListDTO
  >
  implements WeeklyConfigPortIn
{
  protected override safeParse(
    data: Partial<WeeklyConfigModel>,
  ): SafeParseReturnType<WeeklyConfigFormDTO, WeeklyConfigFormDTO> {
    return WeeklyConfigModelSchema.safeParse(data)
  }
}
