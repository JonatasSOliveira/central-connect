import { ChurchModelSchema } from '@/domain/models/church.model'
import { z } from 'zod'

export const ChurchListDtoSchema = ChurchModelSchema.extend({
  id: z.string(),
})

export type ChurchListDto = z.infer<typeof ChurchListDtoSchema>
