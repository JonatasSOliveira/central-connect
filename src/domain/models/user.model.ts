import { z } from 'zod'
import { PersonModelSchema } from '@/domain/models/person.model'
import { BaseModelSchema } from '@/domain/models/base.model'

export const UserModelSchema = BaseModelSchema.extend({
  email: z.string().email(),
  person: PersonModelSchema,
  userRoleId: z.string(),
})

export type UserModel = z.infer<typeof UserModelSchema>
