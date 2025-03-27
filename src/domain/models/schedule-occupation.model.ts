import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'

export const ScheduleOccupationModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  description: z.string().optional(),
})

export type ScheduleOccupationModel = z.infer<
  typeof ScheduleOccupationModelSchema
>
