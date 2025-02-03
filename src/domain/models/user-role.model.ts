import { z } from 'zod'
import { BaseModelSchema } from '@/domain/models/base.model'
import { ResourcePermissionModelSchema } from '@/domain/models/resource-permission.model'

export const UserRoleModelSchema = BaseModelSchema.extend({
  name: z.string(),
  resourcePermissions: z.array(ResourcePermissionModelSchema),
})

export type UserRoleModel = z.infer<typeof UserRoleModelSchema>
