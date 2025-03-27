import { UserModel } from '@/domain/models/user.model'
import { BaseRepository } from './base-repository'

export type UserRepository = BaseRepository<UserModel>
