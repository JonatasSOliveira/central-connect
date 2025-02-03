import { z } from 'zod'
import { Permission } from '@/domain/enums/permission.enum'
import { ResourceID } from '@/domain/enums/resource-id.enum'

export const ResourcePermissionModelSchema = z.object({
  resourceId: z.nativeEnum(ResourceID),
  permissions: z.array(z.nativeEnum(Permission)),
})

export type ResourcePermissionModel = z.infer<
  typeof ResourcePermissionModelSchema
>
