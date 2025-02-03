import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { PersonSex } from '../enums/person-sex.enum'

export const PersonModelSchema = BaseModelSchema.extend({
  name: z.string().min(1),
  phoneNumber: z.string().length(11),
  churchRoleId: z.string(),
  churchId: z.string(),
  sex: z.nativeEnum(PersonSex),
})

export type PersonModel = z.infer<typeof PersonModelSchema>
