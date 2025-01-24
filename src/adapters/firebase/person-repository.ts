import { FirebaseBaseRepository } from '@/adapters/firebase/base-repository'
import { PersonModel } from '@/domain/models/person'
import { PersonRepository } from '@/domain/ports/out/person.repository'

export class FirebasePersonRepository
  extends FirebaseBaseRepository<PersonModel>
  implements PersonRepository
{
  constructor() {
    super('persons')
  }
}
