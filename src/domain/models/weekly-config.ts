import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { WorshipServiceTemplateModelSchema } from '@/domain/models/worship-service-template'

export const WeeklyConfigModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  worshipServiceTemplates: z.array(WorshipServiceTemplateModelSchema).min(1),
  churchId: z.string(),
})

export type WeeklyConfigModel = z.infer<typeof WeeklyConfigModelSchema>
