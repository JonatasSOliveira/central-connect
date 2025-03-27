import { UserModel } from '@/domain/models/user.model'
import { UserRepository } from '@/domain/ports/out/user-repository'
import { FirebaseBaseRepository } from './base-repository'

export class FirebaseUserRepository
  extends FirebaseBaseRepository<UserModel>
  implements UserRepository
{
  constructor() {
    super('users')
  }
}
