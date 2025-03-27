import { ChurchModelSchema } from '@/domain/models/church.model'
import { z } from 'zod'

export const ChurchStorageDTOSchema = ChurchModelSchema.pick({
  id: true,
  name: true,
}).extend({
  id: z.string(),
})

export type ChurchStorageDTO = z.infer<typeof ChurchStorageDTOSchema>
