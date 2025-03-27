import { PersonModelSchema } from '@/domain/models/person.model'
import { z } from 'zod'

export const PersonListDTOSchema = PersonModelSchema.extend({
  id: z.string(),
})

export type PersonListDTO = z.infer<typeof PersonListDTOSchema>
