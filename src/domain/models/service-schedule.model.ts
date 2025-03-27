import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { WorshipServiceModelSchema } from '@/domain/models/worship-service.model'
import { PersonModelSchema } from '@/domain/models/person.model'

export const ServiceScheduleModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  worshipService: WorshipServiceModelSchema,
  supervisor: PersonModelSchema,
})

export type ServiceScheduleModel = z.infer<typeof ServiceScheduleModelSchema>
