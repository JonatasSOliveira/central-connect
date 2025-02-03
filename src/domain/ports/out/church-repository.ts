import { ChurchModel } from '@/domain/models/church.model'
import { BaseRepository } from '@/domain/ports/out/base-repository'

export type ChurchRepository = BaseRepository<ChurchModel>
