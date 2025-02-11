import { z } from 'zod'
import { Permission } from '@/domain/enums/permission'
import { ResourceID } from '@/domain/enums/resource-id'
import { BaseModelSchema } from '@/domain/models/base'

export const ResourcePermissionModelSchema = BaseModelSchema.extend({
  resourceId: z.nativeEnum(ResourceID),
  permissions: z.array(z.nativeEnum(Permission)),
})

export type ResourcePermissionModel = z.infer<
  typeof ResourcePermissionModelSchema
>
