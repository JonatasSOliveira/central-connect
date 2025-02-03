import { PersonModel } from '@/domain/models/person.model'
import { BaseRepository } from './base-repository'

export type PersonRepository = BaseRepository<PersonModel>
