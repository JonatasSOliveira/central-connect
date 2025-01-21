import { PersonModelSchema } from '@/domain/models/person'
import { z } from 'zod'

export const PersonCreateDTOSchema = PersonModelSchema.pick({
  name: true,
  phoneNumber: true,
})

export type PersonCreateDTO = z.infer<typeof PersonCreateDTOSchema>
