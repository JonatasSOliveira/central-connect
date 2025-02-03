import { FirebaseBaseRepository } from '@/adapters/firebase/base-repository'
import { ChurchRoleModel } from '@/domain/models/church-role.model'
import { ChurchRoleRepository } from '@/domain/ports/out/church-role-repository'

export class FirebaseChurchRoleRepository
  extends FirebaseBaseRepository<ChurchRoleModel>
  implements ChurchRoleRepository
{
  constructor() {
    super('churchRoles')
  }
}
