import { SafeParseReturnType } from 'zod'
import { PersonCreateDTO } from '../dtos/person/create'
import { PersonListDTO } from '../dtos/person/list'
import { PersonModel, PersonModelSchema } from '../models/person.model'
import { PersonPortIn } from '../ports/in/person.port-in'
import { PersonRepository } from '../ports/out/person.repository'
import { BaseCrudWithChurchService } from './base-crud-with-church.service'

export class PersonService
  extends BaseCrudWithChurchService<
    PersonModel,
    PersonRepository,
    PersonCreateDTO,
    PersonCreateDTO,
    PersonListDTO
  >
  implements PersonPortIn
{
  protected safeParse(
    data: Partial<PersonModel>,
  ): SafeParseReturnType<PersonCreateDTO, PersonCreateDTO> {
    return PersonModelSchema.safeParse(data)
  }
}
