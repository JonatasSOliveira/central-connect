import { UserModel } from '@/domain/models/user'
import { BaseRepository } from './base-repository'

export type UserRepository = BaseRepository<UserModel>
