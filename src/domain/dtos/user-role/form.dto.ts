import { UserRoleModelSchema } from '@/domain/models/user-role.model'
import { z } from 'zod'

export const UserRoleFormDTOSchema = UserRoleModelSchema.pick({
  name: true,
  resourcePermissions: true,
})

export type UserRoleFormDTO = z.infer<typeof UserRoleFormDTOSchema>
