import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { timeSchema } from '@/domain/types/zod/time'

export const WorshipServiceModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  date: z.date(),
  startTime: timeSchema,
  endTime: timeSchema.optional(),
})

export type WorshipServiceModel = z.infer<typeof WorshipServiceModelSchema>
