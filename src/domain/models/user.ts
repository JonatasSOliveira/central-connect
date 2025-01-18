import { z } from 'zod'
import { PersonModelSchema } from '@/domain/models/person'
import { UserRoleModelSchema } from '@/domain/models/user-role'
import { BaseModelSchema } from '@/domain/models/base'

export const UserModelSchema = BaseModelSchema.extend({
  person: PersonModelSchema,
  userRole: UserRoleModelSchema,
})

export type UserModel = z.infer<typeof UserModelSchema>
