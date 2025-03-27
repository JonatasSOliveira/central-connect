import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { PersonModelSchema } from '@/domain/models/person.model'
import { ServiceScheduleModelSchema } from '@/domain/models/service-schedule.model'
import { ScheduleOccupationModelSchema } from '@/domain/models/schedule-occupation.model'

export const SchedulePersonModelSchema = BaseModelSchema.extend({
  person: PersonModelSchema,
  serviceSchedule: ServiceScheduleModelSchema,
  occupation: ScheduleOccupationModelSchema,
})

export type SchedulePersonModel = z.infer<typeof SchedulePersonModelSchema>
