import { BaseModel } from '@/domain/models/base.model'
import { Where } from './where'

export interface QueryOptions<Model extends BaseModel> {
  where?: Where<Model>
}
