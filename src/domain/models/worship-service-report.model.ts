import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'

export const WorshipServiceReportModelSchema = BaseModelSchema.extend({
  note: z.string().min(3),
})

export type WorshipServiceReportModel = z.infer<
  typeof WorshipServiceReportModelSchema
>
