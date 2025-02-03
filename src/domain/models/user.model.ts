import { z } from 'zod'
import { PersonModelSchema } from '@/domain/models/person.model'
import { UserRoleModelSchema } from '@/domain/models/user-role.model'
import { BaseModelSchema } from '@/domain/models/base.model'

export const UserModelSchema = BaseModelSchema.extend({
  person: PersonModelSchema,
  userRole: UserRoleModelSchema,
})

export type UserModel = z.infer<typeof UserModelSchema>
