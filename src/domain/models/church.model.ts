import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'

export const ChurchModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
})

export type ChurchModel = z.infer<typeof ChurchModelSchema>
