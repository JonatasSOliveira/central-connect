import { PersonModel } from '@/domain/models/person'
import { BaseRepository } from './base-repository'

export type PersonRepository = BaseRepository<PersonModel>
