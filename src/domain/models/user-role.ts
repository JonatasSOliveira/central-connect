import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base'
import { ResourcePermissionModelSchema } from '@/domain/models/resource-permission'

export const UserRoleModelSchema = BaseModelSchema.extend({
  name: z.string(),
  resourcePermissions: z.array(ResourcePermissionModelSchema),
})

export type UserRoleModel = z.infer<typeof UserRoleModelSchema>
