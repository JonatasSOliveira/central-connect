import { BaseModel } from '@/domain/models/base'
import { QueryOptions } from '@/domain/types/repositories/query-options'

export interface BaseRepository<Model extends BaseModel> {
  create(data: Partial<Model>, createdByUserId?: string): Promise<string>
  list(options?: QueryOptions<Model>): Promise<Model[]>
  logicalDelete(id: string, updatedByUserId?: string): Promise<void>
  update(
    id: string,
    data: Partial<Model>,
    updatedByUserId?: string,
  ): Promise<void>
}
