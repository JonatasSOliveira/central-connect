import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { PersonModelSchema } from '@/domain/models/person'
import { ScheduleOccupationModelSchema } from '@/domain/models/schedule-occupation'

export const ServiceScheduleTemplateModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  occupations: z.array(ScheduleOccupationModelSchema),
  supervisor: PersonModelSchema,
})

export type ServiceScheduleTemplateModel = z.infer<
  typeof ServiceScheduleTemplateModelSchema
>
