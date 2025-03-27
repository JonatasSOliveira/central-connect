import { BaseModel } from '@/domain/models/base.model'

export type Where<Model extends BaseModel> = {
  [Key in keyof Model]?: Model[Key]
}
