import { BaseModel } from '@/domain/models/base'
import { QueryOptions } from '@/domain/types/repositories/query-options'

export interface BaseRepository<Model extends BaseModel> {
  create(user: Partial<Model>): Promise<string>
  list(options?: QueryOptions<Model>): Promise<Model[]>
}
