import { BaseModel } from '@/domain/models/base'
import { Where } from './where'

export interface QueryOptions<Model extends BaseModel> {
  where: Where<Model>
}
