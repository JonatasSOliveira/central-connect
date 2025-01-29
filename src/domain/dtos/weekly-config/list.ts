import { WeeklyConfigModelSchema } from '@/domain/models/weekly-config'
import { z } from 'zod'

export const WeeklyConfigListDTOSchema = WeeklyConfigModelSchema

export type WeeklyConfigListDTO = z.infer<typeof WeeklyConfigListDTOSchema>
