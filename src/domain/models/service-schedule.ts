import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { WorshipServiceModelSchema } from '@/domain/models/worship-service'
import { PersonModelSchema } from '@/domain/models/person'

export const ServiceScheduleModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  worshipService: WorshipServiceModelSchema,
  supervisor: PersonModelSchema,
})

export type ServiceScheduleModel = z.infer<typeof ServiceScheduleModelSchema>
