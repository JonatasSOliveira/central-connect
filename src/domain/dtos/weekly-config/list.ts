import { WeeklyConfigModelSchema } from '@/domain/models/weekly-config.model'
import { z } from 'zod'

export const WeeklyConfigListDTOSchema = WeeklyConfigModelSchema.extend({
  id: z.string(),
})

export type WeeklyConfigListDTO = z.infer<typeof WeeklyConfigListDTOSchema>
