import { UserRoleModelSchema } from '@/domain/models/user-role.model'
import { z } from 'zod'

export const UserRoleListDTOSchema = UserRoleModelSchema.extend({
  id: z.string(),
})

export type UserRoleListDTO = z.infer<typeof UserRoleListDTOSchema>
