import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { PersonModelSchema } from '@/domain/models/person'
import { ServiceScheduleModelSchema } from '@/domain/models/service-schedule'
import { ScheduleOccupationModelSchema } from '@/domain/models/schedule-occupation'

export const SchedulePersonModelSchema = BaseModelSchema.extend({
  person: PersonModelSchema,
  serviceSchedule: ServiceScheduleModelSchema,
  occupation: ScheduleOccupationModelSchema,
})

export type SchedulePersonModel = z.infer<typeof SchedulePersonModelSchema>
