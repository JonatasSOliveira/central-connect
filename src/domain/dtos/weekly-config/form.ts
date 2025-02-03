import { WeeklyConfigModelSchema } from '@/domain/models/weekly-config'
import { z } from 'zod'

export const WeeklyConfigFormDTOSchema = WeeklyConfigModelSchema.omit({
  churchId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

export type WeeklyConfigFormDTO = z.infer<typeof WeeklyConfigFormDTOSchema>
