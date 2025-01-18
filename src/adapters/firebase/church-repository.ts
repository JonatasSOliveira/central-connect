import { FirebaseBaseRepository } from '@/adapters/firebase/base-repository'
import { ChurchModel } from '@/domain/models/church'
import { ChurchRepository } from '@/domain/ports/out/church-repository'

export class FirebaseChurchRepository
  extends FirebaseBaseRepository<ChurchModel>
  implements ChurchRepository
{
  constructor() {
    super('churches')
  }
}
