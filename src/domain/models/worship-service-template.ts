import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { ServiceScheduleTemplateModelSchema } from '@/domain/models/service-schedule-template'
import { timeSchema } from '@/domain/types/time'
import { DayOfWeek } from '@/domain/enums/day-of-week'

export const WorshipServiceTemplateModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: timeSchema,
  endTime: timeSchema.optional(),
  schedules: z.array(ServiceScheduleTemplateModelSchema),
})

export type WorshipServiceTemplateModel = z.infer<
  typeof WorshipServiceTemplateModelSchema
>
