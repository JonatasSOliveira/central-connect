import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { WorshipServiceTemplateModelSchema } from '@/domain/models/worship-service-template'

export const WeeklyConfigModelSchema = BaseModelSchema.extend({
  worshipServices: z.array(WorshipServiceTemplateModelSchema),
})

export type WeeklyConfigModel = z.infer<typeof WeeklyConfigModelSchema>
