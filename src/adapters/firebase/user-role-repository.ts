import { FirebaseBaseRepository } from './base-repository'
import { UserRoleRepository } from '@/domain/ports/out/user-role-repository.port-out'
import { UserRoleModel } from '@/domain/models/user-role.model'

export class FirebaseUserRoleRepository
  extends FirebaseBaseRepository<UserRoleModel>
  implements UserRoleRepository
{
  constructor() {
    super('userRoles')
  }
}
