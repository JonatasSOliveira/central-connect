import { UserModel } from '@/domain/models/user'

export interface UserRepository {
  create(user: Partial<UserModel>): Promise<string>
}
