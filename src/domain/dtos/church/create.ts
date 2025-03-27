import { ChurchModelSchema } from '@/domain/models/church.model'
import { z } from 'zod'

export const ChurchCreateDTOSchema = ChurchModelSchema.pick({ name: true })

export type ChurchCreateDTO = z.infer<typeof ChurchCreateDTOSchema>
