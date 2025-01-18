import { ChurchModelSchema } from '@/domain/models/church'
import { z } from 'zod'

export const ChurchListDtoSchema = ChurchModelSchema

export type ChurchListDto = z.infer<typeof ChurchListDtoSchema>
