import { WeeklyConfigModelSchema } from '@/domain/models/weekly-config'
import { z } from 'zod'

export const WeeklyConfigFormDTOSchema = WeeklyConfigModelSchema

export type WeeklyConfigFormDTO = z.infer<typeof WeeklyConfigFormDTOSchema>
