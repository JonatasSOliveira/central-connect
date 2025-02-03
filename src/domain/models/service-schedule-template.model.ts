import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { PersonModelSchema } from '@/domain/models/person.model'
import { ScheduleOccupationModelSchema } from '@/domain/models/schedule-occupation.model'

export const ServiceScheduleTemplateModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  occupations: z.array(ScheduleOccupationModelSchema),
  supervisor: PersonModelSchema,
})

export type ServiceScheduleTemplateModel = z.infer<
  typeof ServiceScheduleTemplateModelSchema
>
