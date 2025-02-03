import { z } from 'zod'
import { ServiceScheduleTemplateModelSchema } from '@/domain/models/service-schedule-template.model'
import { timeSchema } from '@/domain/types/zod/time'
import { DayOfWeek } from '../enums/day-of-week.enum'

export const WorshipServiceTemplateModelSchema = z.object({
  name: z.string().min(1),
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: timeSchema,
  endTime: timeSchema.optional(),
  schedules: z.array(ServiceScheduleTemplateModelSchema).optional(),
})

export type WorshipServiceTemplateModel = z.infer<
  typeof WorshipServiceTemplateModelSchema
>
