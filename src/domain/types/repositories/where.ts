import { BaseModel } from '@/domain/models/base'

export type Where<Model extends BaseModel> = {
  [Key in keyof Model]?: Model[Key]
}
